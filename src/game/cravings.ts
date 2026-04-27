import { ActionKind, GameState } from './state';

export const CRAVING_EMOJI: Record<Exclude<ActionKind, 'tap'>, string> = {
  coke:  '🥤',
  jager: '🍷',
  weed:  '💨',
  water: '🌻',
};

export const CRAVING_LABEL: Record<Exclude<ActionKind, 'tap'>, string> = {
  coke:  'a diet coke',
  jager: 'a jäger',
  weed:  'a smoke',
  water: 'a sunflower',
};

const CRAVING_KINDS: Exclude<ActionKind, 'tap'>[] = ['coke', 'jager', 'weed', 'water'];

// New craving every ~4-6 minutes once she has nothing pending.
const COOLDOWN_MIN_MS = 4 * 60 * 1000;
const COOLDOWN_MAX_MS = 6 * 60 * 1000;

export const shouldStartCraving = (state: GameState, now: number): boolean => {
  if (state.craving.kind !== null) return false;
  // After fulfilling (or first run), wait the cooldown before the next.
  if (now - state.craving.since < COOLDOWN_MIN_MS) return false;
  // Add some jitter so it doesn't feel mechanical.
  return Math.random() < (now - state.craving.since) / COOLDOWN_MAX_MS;
};

// Pick what she wants. Bias toward whatever stat is lowest right now —
// her body knows what it needs. Coke → sass. Jager → vibes. Weed → chill.
// Water → joy.
export const pickCraving = (state: GameState): Exclude<ActionKind, 'tap'> => {
  const s = state.stats;
  const hunger: { kind: Exclude<ActionKind, 'tap'>; need: number }[] = [
    { kind: 'coke',  need: 100 - s.sass  },
    { kind: 'jager', need: 100 - s.vibes },
    { kind: 'weed',  need: 100 - s.chill },
    { kind: 'water', need: 100 - s.joy   },
  ];
  // Weighted random: bias toward greatest need but with some randomness.
  const total = hunger.reduce((acc, h) => acc + h.need, 0) || 1;
  let pick = Math.random() * total;
  for (const h of hunger) {
    pick -= h.need;
    if (pick <= 0) return h.kind;
  }
  return CRAVING_KINDS[Math.floor(Math.random() * CRAVING_KINDS.length)]!;
};

export const startCraving = (state: GameState, now: number): GameState => ({
  ...state,
  craving: {
    kind: pickCraving(state),
    since: now,
    fulfilledCount: state.craving.fulfilledCount,
  },
});

// Called when the player triggers an action via a station. If the action
// matches the current craving, mark it fulfilled and clear it.
export const tryFulfillCraving = (
  state: GameState,
  kind: ActionKind,
  now: number,
): { state: GameState; fulfilled: boolean } => {
  if (!state.craving.kind || state.craving.kind !== kind) {
    return { state, fulfilled: false };
  }
  return {
    state: {
      ...state,
      craving: {
        kind: null,
        since: now,
        fulfilledCount: state.craving.fulfilledCount + 1,
      },
    },
    fulfilled: true,
  };
};
