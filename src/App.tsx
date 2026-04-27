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

import { TopDownMap } from './components/TopDownMap';
import { Stations, STATIONS, Station, StationKind } from './components/Stations';
import { WalkingPrincess } from './components/WalkingPrincess';
import { TapIndicator } from './components/TapIndicator';
import { Stats } from './components/Stats';
import { SpeechBubble } from './components/SpeechBubble';
import { Letter } from './components/Letter';
import { Journal } from './components/Journal';
import { JournalButton } from './components/JournalButton';
import { ChatSheet } from './components/ChatSheet';
import { Settings } from './components/Settings';

const LETTER_THRESHOLD_MIN = 90;
const SASS_COOLDOWN_MS = 2400;
const MAX_CHAT_MESSAGES = 80;
const STATION_COOLDOWN_MS = 1000 * 60 * 4;
const PROXIMITY = 0.12; // when princess is within this distance of a station, pickup fires

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
  const [booted, setBooted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // World — princess 2D position on the map, station cooldowns.
  const [princessTarget, setPrincessTarget] = useState({ x: 0.5, y: 0.55 });
  const [cooldowns, setCooldowns] = useState<Partial<Record<StationKind, number>>>({});
  const [tapMark, setTapMark] = useState<{ x: number; y: number; nonce: number } | null>(null);
  const [pickupSparkles, setPickupSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const pendingStation = useRef<Station | null>(null);

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

  // Idle wandering — every ~30s pick a random walkable spot on the map
  // (avoiding station areas) and stroll there.
  useEffect(() => {
    if (sleeping) return;
    const t = setInterval(() => {
      if (pendingStation.current) return;
      const x = 0.3 + Math.random() * 0.4;
      const y = 0.4 + Math.random() * 0.3;
      setPrincessTarget({ x, y });
    }, 30_000);
    return () => clearInterval(t);
  }, [sleeping]);

  // First-run + return letter + daily letter + companions.
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

  // Tap empty floor → walk princess to that point.
  const onMapTap = useCallback((xPct: number, yPct: number) => {
    pendingStation.current = null;
    setPrincessTarget({ x: xPct, y: yPct });
    haptic('light');
  }, []);

  // Tap a station → walk princess to it; on arrival, pick up.
  const onStationTap = useCallback(
    (s: Station) => {
      const cd = cooldowns[s.id];
      if (cd && cd > Date.now()) {
        setSpeech('that one needs a minute. try again later.');
        return;
      }
      pendingStation.current = s;
      // Stand a bit below the station so princess sprite doesn't overlap it.
      setPrincessTarget({ x: s.x, y: s.y + 0.06 });
      haptic('light');
    },
    [cooldowns],
  );

  // Princess arrived somewhere — if she walked TO a station, fire pickup.
  const onPrincessArrive = useCallback(
    (x: number, y: number) => {
      const target = pendingStation.current;
      if (!target) return;
      // Verify proximity (defensive — should always be close)
      const dist = Math.hypot(x - target.x, y - (target.y + 0.06));
      if (dist > PROXIMITY) return;
      pendingStation.current = null;
      setCooldowns((prev) => ({ ...prev, [target.id]: Date.now() + STATION_COOLDOWN_MS }));
      // Sparkle burst at station
      setPickupSparkles((prev) => [
        ...prev.slice(-3),
        { id: Date.now(), x: target.x, y: target.y },
      ]);
      setTimeout(() => {
        setPickupSparkles((prev) => prev.slice(1));
      }, 1100);
      applyAction(target.action);
    },
    [applyAction],
  );

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

  // Flash tap indicator at last tap location (in screen coordinates)
  const trackTap: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setTapMark({ x: e.clientX, y: e.clientY, nonce: Date.now() });
  };

  return (
    <div
      onPointerUp={trackTap}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        filter: stonedFilter,
        transition: 'filter 0.6s ease',
        background: '#221538',
      }}
    >
      <TopDownMap phase={phase} onMapTap={onMapTap}>
        <Stations cooldowns={cooldowns} onStationTap={onStationTap} />
        <WalkingPrincess
          pose={visiblePose}
          drunk={tickedState.drunk}
          high={tickedState.high}
          targetX={princessTarget.x}
          targetY={princessTarget.y}
          onArrive={onPrincessArrive}
          onTap={() => {
            haptic('light');
            setChatOpen(true);
          }}
          onLongPress={handleLongPress}
        />
        {pickupSparkles.map((p) => (
          <PickupSparkles key={p.id} xPct={p.x} yPct={p.y} />
        ))}
      </TopDownMap>

      <Stats stats={tickedState.stats} />
      <Title flowers={tickedState.flowersAllTime} activity={activityLabel(activity)} />
      <SpeechBubble text={speech} loading={speechLoading} />
      <JournalButton
        count={tickedState.journal.length}
        unread={journalUnread}
        onClick={openJournal}
      />
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <ChatHint visible={!chatOpen && !letter && !journalOpen && tickedState.journal.length <= 1} />

      {!motionGranted && needsMotionPermission() && <SensorCTA onTap={enableMotion} />}

      <ShakeBurst nonce={shakeBurst} />

      {tapMark && (
        <TapIndicator x={tapMark.x} y={tapMark.y} nonce={tapMark.nonce} />
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

      {/* Reference STATIONS once so the import isn't dead. */}
      <span style={{ display: 'none' }}>{STATIONS.length}</span>
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
    className="stardew-button"
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      right: 78,
      width: 44,
      height: 44,
      padding: 0,
      cursor: 'pointer',
      fontSize: 20,
      color: 'var(--stardew-text)',
      zIndex: 11,
      lineHeight: 1,
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
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 14px)',
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
      }}
    >
      tap floor to walk · tap a station to collect · tap princess to chat
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

const PickupSparkles = ({ xPct, yPct }: { xPct: number; yPct: number }) => (
  <div
    style={{
      position: 'absolute',
      left: `${xPct * 100}%`,
      top: `${yPct * 100}%`,
      transform: 'translate(-50%, -50%)',
      width: 20,
      height: 20,
      pointerEvents: 'none',
      zIndex: 6,
    }}
  >
    {[...Array(8)].map((_, i) => {
      const angle = (i * 360) / 8;
      const dx = Math.cos((angle * Math.PI) / 180) * 30;
      const dy = Math.sin((angle * Math.PI) / 180) * 24;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 6,
            height: 6,
            background: '#ffd84d',
            transform: 'rotate(45deg)',
            boxShadow: '0 0 6px #ffe680',
            // @ts-expect-error css var passthrough
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            animation: 'pickup-burst 0.9s ease-out forwards',
            animationDelay: `${i * 30}ms`,
          }}
        />
      );
    })}
  </div>
);

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
