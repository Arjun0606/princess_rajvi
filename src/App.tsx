import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, ActionKind, moodFor } from './game/state';
import { loadState, saveState } from './game/persistence';
import { tick } from './game/decay';
import { giveCoke, giveJager, giveWeed, water, tap as tapAction } from './game/actions';
import { phaseFor } from './game/time';
import { useIdle, useNow, useTilt, requestTiltPermission, haptic } from './game/hooks';
import { fetchSass, fetchLetter } from './ai/princessSays';

import { Sky } from './components/Sky';
import { Castle } from './components/Castle';
import { Princess } from './components/Princess';
import { Garden } from './components/Garden';
import { Stats } from './components/Stats';
import { ActionBar } from './components/ActionBar';
import { SpeechBubble } from './components/SpeechBubble';
import { Letter } from './components/Letter';
import { Effects } from './components/Effects';

const LETTER_THRESHOLD_MIN = 90;
const SASS_COOLDOWN_MS = 2400;

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [effectTrigger, setEffectTrigger] = useState<{ kind: ActionKind; at: number } | null>(null);
  const [tiltGranted, setTiltGranted] = useState(false);

  const lastSassAt = useRef(0);
  const sceneRef = useRef<HTMLDivElement>(null);

  const now = useNow(60_000);
  const date = useMemo(() => new Date(now), [now]);
  const idle = useIdle(60_000);
  const tilt = useTilt();

  const tickedState = useMemo(() => tick(state, now), [state, now]);
  const phase = phaseFor(date.getHours());
  const mood = moodFor(tickedState, date.getHours());
  const sleeping = idle && (phase === 'night' || mood === 'sleepy');

  // Persist + advance the decayed state into local storage every minute.
  useEffect(() => {
    setState(tickedState);
    saveState(tickedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // On first mount: if the player has been gone a while, deliver a letter.
  useEffect(() => {
    const initial = loadState();
    const minutesAway = Math.floor((Date.now() - initial.lastSeen) / 60000);
    if (minutesAway >= LETTER_THRESHOLD_MIN) {
      (async () => {
        const text = await fetchLetter({
          state: initial,
          mood: moodFor(initial, new Date().getHours()),
          date: new Date(),
          lastAction: null,
          minutesAway,
        });
        setLetter(text);
      })();
    }
    // mark seen
    const updated = { ...initial, lastSeen: Date.now() };
    saveState(updated);
    setState(updated);
  }, []);

  // Periodic save whenever state changes (for action results).
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Princess says hello on first load if no letter is shown.
  useEffect(() => {
    if (letter !== null) return;
    const t = setTimeout(() => {
      requestSass(null);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestSass = useCallback(
    async (lastAction: ActionKind | null) => {
      const elapsed = Date.now() - lastSassAt.current;
      if (elapsed < SASS_COOLDOWN_MS) return;
      lastSassAt.current = Date.now();
      setSpeechLoading(true);
      const text = await fetchSass({
        state,
        mood,
        date: new Date(),
        lastAction,
        minutesAway: 0,
      });
      setSpeechLoading(false);
      setSpeech(text);
    },
    [state, mood],
  );

  const doAction = useCallback(
    (kind: ActionKind) => {
      const t = Date.now();
      let next = state;
      if (kind === 'coke') next = giveCoke(state, t);
      else if (kind === 'jager') next = giveJager(state, t);
      else if (kind === 'weed') next = giveWeed(state, t);
      else if (kind === 'water') next = water(state, t);
      else if (kind === 'tap') next = tapAction(state, t);
      setState(next);
      setEffectTrigger({ kind, at: t });
      haptic(kind === 'jager' ? 'medium' : 'light');
      requestSass(kind);
    },
    [state, requestSass],
  );

  const enableTilt = useCallback(async () => {
    const ok = await requestTiltPermission();
    setTiltGranted(ok);
  }, []);

  // Stoned visual filter on the whole scene.
  const stonedFilter =
    tickedState.high > 0.5
      ? `saturate(${1 + tickedState.high * 0.3}) hue-rotate(${tickedState.high * 6}deg) blur(${
          Math.min(tickedState.high * 0.6, 1.4)
        }px)`
      : undefined;

  // Tilt parallax: shift princess + castle horizontally based on phone angle.
  const tiltShift = tiltGranted ? tilt * 14 : 0;

  return (
    <div
      ref={sceneRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        filter: stonedFilter,
        transition: 'filter 0.6s ease',
      }}
    >
      <Sky date={date} />

      {/* Castle layer */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 110,
          transform: `translateX(calc(-50% + ${tiltShift * 0.4}px))`,
          opacity: 0.95,
        }}
      >
        <Castle size={6} />
      </div>

      {/* Princess layer */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 130,
          transform: `translateX(calc(-50% + ${tiltShift}px))`,
        }}
      >
        <Princess
          mood={mood}
          drunk={tickedState.drunk}
          high={tickedState.high}
          sleeping={sleeping}
          size={5}
          onTap={() => doAction('tap')}
        />
      </div>

      <Garden flowers={tickedState.garden} now={now} />

      <Stats stats={tickedState.stats} />
      <Title flowers={tickedState.flowersAllTime} />
      <SpeechBubble text={speech} loading={speechLoading} />
      <ActionBar onAction={doAction} />
      <Effects trigger={effectTrigger} />

      {!tiltGranted && needsTiltPermission() && <TiltCTA onTap={enableTilt} />}

      {letter !== null && <Letter text={letter} onClose={() => setLetter(null)} />}
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
      top: 'calc(env(safe-area-inset-top, 0) + 88px)',
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

const Title = ({ flowers }: { flowers: number }) => (
  <div
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 56px)',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#fff',
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 2,
      textShadow: '0 2px 6px rgba(0,0,0,0.4)',
      zIndex: 5,
      pointerEvents: 'none',
    }}
  >
    PRINCESS RAJVI
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.2, opacity: 0.85 }}>
      🌻 {flowers} sunflowers · long may she reign
    </div>
  </div>
);
