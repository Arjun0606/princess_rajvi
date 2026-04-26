import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, ActionKind, ChatMessage, JournalEntry, moodFor } from './game/state';
import { loadState, saveState } from './game/persistence';
import { tick } from './game/decay';
import { giveCoke, giveJager, giveWeed, water, tap as tapAction } from './game/actions';
import { phaseFor } from './game/time';
import { activityFor, naturalPoseFor, activityLabel } from './game/routine';
import { useIdle, useNow, useTilt, requestTiltPermission, haptic } from './game/hooks';
import {
  fetchSass,
  fetchLetterOnReturn,
  fetchDailyLetter,
  fetchMilestoneLetter,
  fetchFirstRunLetter,
  fetchReply,
} from './ai/princessSays';
import {
  addEntry,
  shouldWriteDailyLetter,
  checkMilestone,
  recordMilestone,
} from './game/journal';
import { newlyAvailableCompanion, unlockedCompanions } from './game/companions';

import { Background } from './components/Background';
import { PrincessImage } from './components/PrincessImage';
import { Foreground } from './components/Foreground';
import { Companions } from './components/Companions';
import { Particles } from './components/Particles';
import { Stats } from './components/Stats';
import { ActionTray } from './components/ActionTray';
import { SpeechBubble } from './components/SpeechBubble';
import { Letter } from './components/Letter';
import { Journal } from './components/Journal';
import { JournalButton } from './components/JournalButton';
import { ChatSheet } from './components/ChatSheet';

const LETTER_THRESHOLD_MIN = 90;
const SASS_COOLDOWN_MS = 2400;
const MAX_CHAT_MESSAGES = 80;

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalUnread, setJournalUnread] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [tiltGranted, setTiltGranted] = useState(false);

  const lastSassAt = useRef(0);
  const initRanRef = useRef(false);

  const now = useNow(60_000);
  const date = useMemo(() => new Date(now), [now]);
  const idle = useIdle(60_000);
  const tilt = useTilt();

  const tickedState = useMemo(() => tick(state, now), [state, now]);
  const phase = phaseFor(date.getHours());
  const activity = activityFor(date.getHours());
  const mood = moodFor(tickedState, date.getHours());
  const sleeping = activity === 'sleeping' || (idle && phase === 'night');
  const naturalPose = naturalPoseFor(activity);
  const visiblePose = sleeping
    ? 'sleep'
    : tickedState.pose === 'default'
      ? naturalPose
      : tickedState.pose;

  // Persist + advance state once per minute.
  useEffect(() => {
    setState(tickedState);
    saveState(tickedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // First-run + return-from-absence flow. Runs once on mount.
  useEffect(() => {
    if (initRanRef.current) return;
    initRanRef.current = true;
    (async () => {
      const initial = loadState();
      const minutesAway = Math.floor((Date.now() - initial.lastSeen) / 60000);
      const isFirstRun =
        initial.journal.length === 0 && initial.startedAt > Date.now() - 60_000;
      const today = new Date();

      if (isFirstRun) {
        const text = await fetchFirstRunLetter({
          state: initial,
          mood: moodFor(initial, today.getHours()),
          activity: activityFor(today.getHours()),
          date: today,
          lastAction: null,
          minutesAway: 0,
        });
        const updated: GameState = {
          ...addEntry(initial, { at: Date.now(), kind: 'firstrun', text }),
          lastSeen: Date.now(),
        };
        setState(updated);
        saveState(updated);
        setLetter(text);
        setJournalUnread(true);
        return;
      }

      let working = initial;

      if (minutesAway >= LETTER_THRESHOLD_MIN) {
        const text = await fetchLetterOnReturn({
          state: working,
          mood: moodFor(working, today.getHours()),
          activity: activityFor(today.getHours()),
          date: today,
          lastAction: null,
          minutesAway,
        });
        working = addEntry(working, { at: Date.now(), kind: 'return', text });
        setLetter(text);
        setJournalUnread(true);
      }

      if (shouldWriteDailyLetter(working, Date.now())) {
        const text = await fetchDailyLetter({
          state: working,
          mood: moodFor(working, today.getHours()),
          activity: activityFor(today.getHours()),
          date: today,
          lastAction: null,
          minutesAway: 0,
        });
        working = {
          ...addEntry(working, { at: Date.now(), kind: 'daily', text }),
          lastDailyLetterAt: Date.now(),
        };
        setJournalUnread(true);
      }

      // Companion newly available?
      const newCompanion = newlyAvailableCompanion(working);
      if (newCompanion) {
        const text = await fetchMilestoneLetter(
          {
            state: working,
            mood: moodFor(working, today.getHours()),
            activity: activityFor(today.getHours()),
            date: today,
            lastAction: null,
            minutesAway: 0,
          },
          `a ${newCompanion.name} has joined the kingdom — ${newCompanion.blurb}`,
        );
        working = addEntry(
          {
            ...working,
            milestones: { ...working.milestones, [`companion-${newCompanion.id}`]: Date.now() },
          },
          { at: Date.now(), kind: 'milestone', text, icon: newCompanion.emoji },
        );
        setJournalUnread(true);
      }

      const updated: GameState = { ...working, lastSeen: Date.now() };
      setState(updated);
      saveState(updated);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Princess says hello after the welcome letter is dismissed.
  useEffect(() => {
    if (letter !== null) return;
    const t = setTimeout(() => requestSass(null), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  const requestSass = useCallback(
    async (lastAction: ActionKind | null) => {
      const elapsed = Date.now() - lastSassAt.current;
      if (elapsed < SASS_COOLDOWN_MS) return;
      lastSassAt.current = Date.now();
      setSpeechLoading(true);
      const text = await fetchSass({
        state,
        mood,
        activity,
        date: new Date(),
        lastAction,
        minutesAway: 0,
      });
      setSpeechLoading(false);
      setSpeech(text);
    },
    [state, mood, activity],
  );

  const handleMilestone = useCallback(async (next: GameState) => {
    const milestone = checkMilestone(next);
    if (!milestone) return next;
    const today = new Date();
    const text = await fetchMilestoneLetter(
      {
        state: next,
        mood: moodFor(next, today.getHours()),
        activity: activityFor(today.getHours()),
        date: today,
        lastAction: null,
        minutesAway: 0,
      },
      milestone.label,
    );
    const withEntry = addEntry(recordMilestone(next, milestone.id, Date.now()), {
      at: Date.now(),
      kind: 'milestone',
      text,
      icon: milestone.icon,
    });
    setJournalUnread(true);
    return withEntry;
  }, []);

  const doAction = useCallback(
    async (kind: ActionKind) => {
      const t = Date.now();
      let next = state;
      if (kind === 'coke') next = giveCoke(state, t);
      else if (kind === 'jager') next = giveJager(state, t);
      else if (kind === 'weed') next = giveWeed(state, t);
      else if (kind === 'water') next = water(state, t);
      else if (kind === 'tap') next = tapAction(state, t);

      next = await handleMilestone(next);

      setState(next);
      haptic(kind === 'jager' ? 'medium' : 'light');
      requestSass(kind);
    },
    [state, requestSass, handleMilestone],
  );

  // Two-way chat.
  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `m-${Date.now()}-u`,
        at: Date.now(),
        role: 'user',
        text,
      };
      const withUser = {
        ...state,
        chats: [...state.chats, userMsg].slice(-MAX_CHAT_MESSAGES),
      };
      setState(withUser);
      saveState(withUser);
      setChatBusy(true);
      haptic('light');
      const reply = await fetchReply(
        {
          state: withUser,
          mood,
          activity,
          date: new Date(),
          lastAction: null,
          minutesAway: 0,
        },
        text,
        withUser.chats,
      );
      const princessMsg: ChatMessage = {
        id: `m-${Date.now()}-p`,
        at: Date.now(),
        role: 'princess',
        text: reply,
      };
      const next = {
        ...withUser,
        chats: [...withUser.chats, princessMsg].slice(-MAX_CHAT_MESSAGES),
      };
      setState(next);
      saveState(next);
      setChatBusy(false);
      haptic('light');
    },
    [state, mood, activity],
  );

  const enableTilt = useCallback(async () => {
    const ok = await requestTiltPermission();
    setTiltGranted(ok);
  }, []);

  const stonedFilter =
    tickedState.high > 0.5
      ? `saturate(${1 + tickedState.high * 0.18}) hue-rotate(${tickedState.high * 4}deg) blur(${
          Math.min(tickedState.high * 0.4, 1.0)
        }px)`
      : undefined;

  const tiltShift = tiltGranted ? tilt * 14 : 0;

  const openJournal = () => {
    setJournalOpen(true);
    setJournalUnread(false);
  };

  const sortedJournal: JournalEntry[] = useMemo(
    () => [...tickedState.journal].sort((a, b) => b.at - a.at),
    [tickedState.journal],
  );

  const companions = useMemo(() => unlockedCompanions(tickedState), [tickedState]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        filter: stonedFilter,
        transition: 'filter 0.6s ease',
        background: '#1a1340',
      }}
    >
      <Background date={date} />
      <Particles phase={phase} />

      {/* Princess — main subject layer. data-drop-target lets dragged items
          from the action tray land on her and trigger the matching action. */}
      <div
        data-drop-target="princess"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 130,
          transform: `translateX(calc(-50% + ${tiltShift}px))`,
          zIndex: 3,
        }}
      >
        <PrincessImage
          pose={visiblePose}
          drunk={tickedState.drunk}
          high={tickedState.high}
          sleeping={sleeping}
          onTap={() => {
            haptic('light');
            setChatOpen(true);
          }}
        />
      </div>

      <Foreground
        itemsOnTable={tickedState.itemsOnTable}
        flowers={tickedState.garden}
        now={now}
      />

      <Companions companions={companions} />

      <Stats stats={tickedState.stats} />
      <Title flowers={tickedState.flowersAllTime} activity={activityLabel(activity)} />
      <SpeechBubble text={speech} loading={speechLoading} />
      <ActionTray onAction={doAction} />
      <JournalButton
        count={tickedState.journal.length}
        unread={journalUnread}
        onClick={openJournal}
      />
      <ChatHint visible={!chatOpen && !letter && !journalOpen} />

      {!tiltGranted && needsTiltPermission() && <TiltCTA onTap={enableTilt} />}

      {letter !== null && <Letter text={letter} onClose={() => setLetter(null)} />}
      {journalOpen && (
        <Journal
          entries={sortedJournal}
          startedAt={tickedState.startedAt}
          onClose={() => setJournalOpen(false)}
        />
      )}

      <ChatSheet
        open={chatOpen}
        messages={tickedState.chats}
        pose={visiblePose}
        busy={chatBusy}
        onSend={sendMessage}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}

const needsTiltPermission = () => {
  const D = (window as unknown as {
    DeviceOrientationEvent?: { requestPermission?: () => unknown };
  }).DeviceOrientationEvent;
  return !!D?.requestPermission;
};

const TiltCTA = ({ onTap }: { onTap: () => void }) => (
  <button
    onClick={onTap}
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 80px)',
      right: 16,
      background: 'rgba(255,255,255,0.85)',
      border: 'none',
      padding: '6px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 700,
      color: '#3a1340',
      zIndex: 11,
    }}
  >
    enable tilt
  </button>
);

const Title = ({ flowers, activity }: { flowers: number; activity: string }) => (
  <div
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 88px)',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2.5,
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
      zIndex: 5,
      pointerEvents: 'none',
    }}
  >
    PRINCESS RAJVI · {activity.toUpperCase()}
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1.4,
        opacity: 0.85,
        marginTop: 3,
      }}
    >
      🌻 {flowers} sunflowers in the garden
    </div>
  </div>
);

const ChatHint = ({ visible }: { visible: boolean }) => {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShown(false), 6000);
    return () => clearTimeout(t);
  }, []);
  if (!visible || !shown) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 110px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontSize: 11,
        padding: '6px 12px',
        borderRadius: 12,
        letterSpacing: 0.8,
        animation: 'pop 0.4s ease',
        zIndex: 9,
        pointerEvents: 'none',
      }}
    >
      tap her to chat · drag items onto her
    </div>
  );
};
