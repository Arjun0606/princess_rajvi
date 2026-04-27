import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, ActionKind, ChatMessage, JournalEntry, moodFor } from './game/state';
import { loadState, saveState } from './game/persistence';
import { tick } from './game/decay';
import { giveCoke, giveJager, giveWeed, water, tap as tapAction } from './game/actions';
import { phaseFor } from './game/time';
import { activityFor, naturalPoseFor, activityLabel } from './game/routine';
import {
  useIdle,
  useNow,
  haptic,
  useShake,
  requestMotionPermission,
} from './game/hooks';
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
import { newlyAvailableCompanion } from './game/companions';

import { Background } from './components/Background';
import { WalkingPrincess } from './components/WalkingPrincess';
import { FloorItem } from './components/FloorItem';
import { Particles } from './components/Particles';
import { Stats } from './components/Stats';
import { ActionTray } from './components/ActionTray';
import { SpeechBubble } from './components/SpeechBubble';
import { Letter } from './components/Letter';
import { Journal } from './components/Journal';
import { JournalButton } from './components/JournalButton';
import { ChatSheet } from './components/ChatSheet';
import { Settings } from './components/Settings';
import { FlowerInfo } from './components/FlowerInfo';

const LETTER_THRESHOLD_MIN = 90;
const SASS_COOLDOWN_MS = 2400;
const MAX_CHAT_MESSAGES = 80;
const IDLE_WANDER_MS = 35_000;

type FloorThing = {
  id: string;
  kind: 'coke' | 'jager' | 'joint' | 'sunflower';
  x: number;
  droppedAt: number;
  picked: boolean;
};

const ACTION_TO_FLOOR_KIND: Record<ActionKind, FloorThing['kind'] | null> = {
  coke: 'coke',
  jager: 'jager',
  weed: 'joint',
  water: 'sunflower',
  tap: null,
};

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalUnread, setJournalUnread] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [motionGranted, setMotionGranted] = useState(false);
  const [shakeBurst, setShakeBurst] = useState(0);
  const [tappedFlower, setTappedFlower] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // World — princess position and dropped items.
  const [princessX, setPrincessX] = useState(0.5);
  const [floorItems, setFloorItems] = useState<FloorThing[]>([]);
  const pendingPickup = useRef<{ itemId: string; action: ActionKind } | null>(null);

  const lastSassAt = useRef(0);
  const initRanRef = useRef(false);

  const now = useNow(60_000);
  const date = useMemo(() => new Date(now), [now]);
  const idle = useIdle(120_000);

  const tickedState = useMemo(() => tick(state, now), [state, now]);
  const phase = phaseFor(date.getHours());
  const activity = activityFor(date.getHours());
  const mood = moodFor(tickedState, date.getHours());
  const sleeping = activity === 'sleeping' || (idle && phase === 'night');
  const naturalPose = naturalPoseFor(activity);
  const visiblePose = sleeping
    ? 'sleep'
    : (tickedState.pose === 'default' ? naturalPose : tickedState.pose);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setState(tickedState);
    saveState(tickedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Idle wandering — every ~35s, princess strolls to a random floor position
  // (only when she has no current target/item to pick up and isn't sleeping).
  useEffect(() => {
    if (sleeping) return;
    const t = setInterval(() => {
      if (floorItems.some((i) => !i.picked)) return;
      const newX = 0.18 + Math.random() * 0.64;
      setPrincessX(newX);
    }, IDLE_WANDER_MS);
    return () => clearInterval(t);
  }, [sleeping, floorItems]);

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

  useEffect(() => {
    if (letter !== null) return;
    const t = setTimeout(() => requestSass(null), 700);
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

  // Apply the underlying state mutation (stat changes, milestones) for an
  // action. Called when princess actually picks up the dropped item.
  const applyAction = useCallback(
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

  // User triggered an action — drop the item on the floor at a random spot,
  // and walk princess toward it. The actual stat update fires when she
  // arrives (in onArrive).
  const doAction = useCallback(
    (kind: ActionKind) => {
      const floorKind = ACTION_TO_FLOOR_KIND[kind];
      if (!floorKind) {
        // 'tap' has no floor item — apply immediately.
        applyAction(kind);
        return;
      }
      // Drop item somewhere away from princess so she has a real distance to walk.
      let dropX = 0.18 + Math.random() * 0.64;
      let attempts = 0;
      while (Math.abs(dropX - princessX) < 0.18 && attempts < 6) {
        dropX = 0.18 + Math.random() * 0.64;
        attempts++;
      }
      const id = `fi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setFloorItems((prev) => [...prev, { id, kind: floorKind, x: dropX, droppedAt: Date.now(), picked: false }]);
      pendingPickup.current = { itemId: id, action: kind };
      setPrincessX(dropX);
      haptic('light');
    },
    [applyAction, princessX],
  );

  const itemKindToAction = (kind: FloorThing['kind']): ActionKind => {
    if (kind === 'coke') return 'coke';
    if (kind === 'jager') return 'jager';
    if (kind === 'joint') return 'weed';
    return 'water';
  };

  const onPrincessArrive = useCallback(
    (x: number) => {
      // If she arrived at the specifically pending item, prefer that.
      const pending = pendingPickup.current;
      let target: FloorThing | undefined;
      if (pending) {
        target = floorItems.find((i) => i.id === pending.itemId && !i.picked);
      }
      // Otherwise pick up any item close to where she stopped.
      if (!target) {
        target = floorItems.find((i) => !i.picked && Math.abs(i.x - x) < 0.08);
      }
      if (!target) return;
      pendingPickup.current = null;
      const t = target;
      setFloorItems((prev) =>
        prev.map((i) => (i.id === t.id ? { ...i, picked: true } : i)),
      );
      setTimeout(() => {
        setFloorItems((prev) => prev.filter((i) => i.id !== t.id));
        applyAction(itemKindToAction(t.kind));
      }, 350);
    },
    [applyAction, floorItems],
  );

  const tapItem = useCallback(
    (itemId: string) => {
      const item = floorItems.find((i) => i.id === itemId);
      if (!item || item.picked) return;
      pendingPickup.current = { itemId: item.id, action: itemKindToAction(item.kind) };
      setPrincessX(item.x);
      haptic('light');
    },
    [floorItems],
  );

  // Tap any spot on the playable floor → princess walks there.
  const onFloorTap = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const x = Math.max(0.08, Math.min(0.92, e.clientX / window.innerWidth));
    setPrincessX(x);
    haptic('light');
  }, []);

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

  const enableMotion = useCallback(async () => {
    const ok = await requestMotionPermission();
    setMotionGranted(ok);
  }, []);

  const onShake = useCallback(() => {
    haptic('heavy');
    setShakeBurst((n) => n + 1);
    setSpeech('WHOA. easy with the kingdom.');
  }, []);
  useShake(motionGranted ? onShake : () => {});

  const stonedFilter =
    tickedState.high > 0.5
      ? `saturate(${1 + tickedState.high * 0.18}) hue-rotate(${tickedState.high * 4}deg) blur(${
          Math.min(tickedState.high * 0.4, 1.0)
        }px)`
      : undefined;

  const openJournal = () => {
    setJournalOpen(true);
    setJournalUnread(false);
  };

  const sortedJournal: JournalEntry[] = useMemo(
    () => [...tickedState.journal].sort((a, b) => b.at - a.at),
    [tickedState.journal],
  );

  const tappedFlowerData = useMemo(
    () => tickedState.garden.find((f) => f.id === tappedFlower) ?? null,
    [tickedState.garden, tappedFlower],
  );

  const daysTogether = Math.floor((Date.now() - tickedState.startedAt) / (24 * 60 * 60 * 1000));

  const clearChat = useCallback(() => {
    const next = { ...state, chats: [] };
    setState(next);
    saveState(next);
    setSettingsOpen(false);
  }, [state]);

  const resetWorld = useCallback(() => {
    localStorage.removeItem('princess-rajvi-v2');
    localStorage.removeItem('princess-rajvi-v1');
    window.location.reload();
  }, []);

  const handleLongPress = () => {
    haptic('heavy');
    const lines = [
      'oh. that\'s nice actually.',
      'don\'t stop. keep doing the thing.',
      'i can\'t believe you\'re still here. i love it.',
    ];
    setSpeech(lines[Math.floor(Math.random() * lines.length)]!);
  };

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

      {/* Tap-to-walk zone covering the playable floor area. Sits below the
          princess + items so taps on those still hit. */}
      <div
        data-drop-target="floor"
        onPointerUp={onFloorTap}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '40%',
          bottom: 'calc(env(safe-area-inset-bottom, 0) + 90px)',
          zIndex: 2,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      />

      {/* Floor items — princess walks to these and picks them up */}
      {floorItems.map((it) => (
        <FloorItem
          key={it.id}
          kind={it.kind}
          x={it.x}
          picked={it.picked}
          onTap={() => tapItem(it.id)}
        />
      ))}

      <WalkingPrincess
        pose={visiblePose}
        drunk={tickedState.drunk}
        high={tickedState.high}
        targetX={princessX}
        onArrive={onPrincessArrive}
        onTap={() => {
          haptic('light');
          setChatOpen(true);
        }}
        onLongPress={handleLongPress}
      />

      <Stats stats={tickedState.stats} />
      <Title flowers={tickedState.flowersAllTime} activity={activityLabel(activity)} />
      <SpeechBubble text={speech} loading={speechLoading} />
      <ActionTray onAction={doAction} />
      <JournalButton
        count={tickedState.journal.length}
        unread={journalUnread}
        onClick={openJournal}
      />
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <ChatHint visible={!chatOpen && !letter && !journalOpen && tickedState.journal.length <= 1} />

      {!motionGranted && needsMotionPermission() && <SensorCTA onTap={enableMotion} />}

      <ShakeBurst nonce={shakeBurst} />

      {tappedFlowerData && (
        <FlowerInfo
          name={tappedFlowerData.name}
          plantedAt={tappedFlowerData.plantedAt}
          onClose={() => setTappedFlower(null)}
        />
      )}

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

      <Settings
        open={settingsOpen}
        daysTogether={daysTogether}
        onClose={() => setSettingsOpen(false)}
        onClearChat={clearChat}
        onResetWorld={resetWorld}
      />

      <Splash visible={!booted} />
    </div>
  );
}

const needsMotionPermission = () => {
  const D = (window as unknown as {
    DeviceMotionEvent?: { requestPermission?: () => unknown };
  });
  return !!D.DeviceMotionEvent?.requestPermission;
};

const SettingsButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label="settings"
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      right: 80,
      width: 40,
      height: 40,
      borderRadius: 14,
      border: 'none',
      background: 'rgba(255, 245, 232, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      fontSize: 18,
      color: '#3a1a30',
      zIndex: 11,
    }}
  >
    ⚙︎
  </button>
);

const SensorCTA = ({ onTap }: { onTap: () => void }) => (
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
      letterSpacing: 0.4,
    }}
  >
    enable shake
  </button>
);

const Title = ({
  flowers,
  activity,
}: {
  flowers: number;
  activity: string;
}) => (
  <div
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 88px)',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#fff8e0',
      fontSize: 18,
      fontFamily: 'var(--pixel-font)',
      letterSpacing: 1,
      textShadow: '2px 2px 0 #4a2710, 0 0 12px rgba(0,0,0,0.45)',
      zIndex: 5,
      pointerEvents: 'none',
      lineHeight: 1.05,
    }}
  >
    Princess Rajvi · {activity}
    <div
      style={{
        fontSize: 14,
        opacity: 0.92,
        marginTop: 2,
        letterSpacing: 0.5,
      }}
    >
      🌻 {flowers} sunflowers
    </div>
  </div>
);

const ChatHint = ({ visible }: { visible: boolean }) => {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShown(false), 7000);
    return () => clearTimeout(t);
  }, []);
  if (!visible || !shown) return null;
  return (
    <div
      className="stardew-box"
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 110px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 16,
        padding: '5px 12px 6px',
        borderRadius: 4,
        animation: 'pop 0.4s ease',
        zIndex: 9,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '88vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      tap floor to walk · tap princess to chat
    </div>
  );
};

const ShakeBurst = ({ nonce }: { nonce: number }) => {
  const [bits, setBits] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  useEffect(() => {
    if (nonce === 0) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const next = Array.from({ length: 24 }, (_, i) => ({
      id: nonce * 100 + i,
      x: cx + (Math.random() - 0.5) * 200,
      y: cy + (Math.random() - 0.5) * 300,
      delay: Math.random() * 200,
    }));
    setBits(next);
    const t = setTimeout(() => setBits([]), 1800);
    return () => clearTimeout(t);
  }, [nonce]);
  if (bits.length === 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {bits.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            fontSize: 22,
            animation: 'fizz 1.6s ease-out forwards',
            animationDelay: `${b.delay}ms`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

const Splash = ({ visible }: { visible: boolean }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(180deg, #ffd6ec 0%, #ff9bbf 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      zIndex: 99,
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
      transition: 'opacity 0.5s ease',
    }}
  >
    <div
      style={{
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: 4,
        color: '#3a1338',
        marginBottom: 8,
      }}
    >
      PRINCESS RAJVI
    </div>
    <div style={{ fontSize: 28 }}>🌻</div>
  </div>
);
