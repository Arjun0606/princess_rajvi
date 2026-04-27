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

// Timer mechanics: each craving lives for CRAVING_DURATION_MS. After a
// fulfillment, the next craving spawns FAST so the loop stays tight.
// After a miss, the cooldown is longer so the player gets a breather.
const CRAVING_DURATION_MS = 60 * 1000;       // 60s per craving
const POST_FULFILL_GAP_MIN_MS = 5 * 1000;    // 5s after a hit
const POST_FULFILL_GAP_MAX_MS = 10 * 1000;   // up to 10s
const POST_MISS_GAP_MS        = 25 * 1000;   // 25s after a miss

export const cravingDurationMs = () => CRAVING_DURATION_MS;

// Fraction of the timer remaining (0..1). Used by the UI to draw the
// shrinking bar on the thought bubble.
export const cravingTimeRemaining = (state: GameState, now: number): number => {
  if (!state.craving.kind || state.craving.expiresAt === 0) return 0;
  const remaining = state.craving.expiresAt - now;
  return Math.max(0, Math.min(1, remaining / CRAVING_DURATION_MS));
};

export const shouldStartCraving = (state: GameState, now: number): boolean => {
  if (state.craving.kind !== null) return false;
  // After fulfilling: short gap. After missing: longer.
  // We track the gap by treating `since` as the moment the previous
  // craving ended (fulfilled or expired).
  const elapsed = now - state.craving.since;
  if (state.craving.streak > 0) {
    // Streak alive — quick succession with a touch of randomness.
    if (elapsed < POST_FULFILL_GAP_MIN_MS) return false;
    return Math.random() < (elapsed - POST_FULFILL_GAP_MIN_MS) / (POST_FULFILL_GAP_MAX_MS - POST_FULFILL_GAP_MIN_MS);
  }
  // Streak broken (or first craving) — give the player a breather.
  return elapsed >= POST_MISS_GAP_MS;
};

// Detect a stale craving whose timer ran out. Caller is expected to mark
// it as a miss via markMiss().
export const cravingHasExpired = (state: GameState, now: number): boolean => {
  return state.craving.kind !== null && state.craving.expiresAt > 0 && now > state.craving.expiresAt;
};

export const pickCraving = (state: GameState): Exclude<ActionKind, 'tap'> => {
  const s = state.stats;
  const hunger: { kind: Exclude<ActionKind, 'tap'>; need: number }[] = [
    { kind: 'coke',  need: 100 - s.sass  },
    { kind: 'jager', need: 100 - s.vibes },
    { kind: 'weed',  need: 100 - s.chill },
    { kind: 'water', need: 100 - s.joy   },
  ];
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
    ...state.craving,
    kind: pickCraving(state),
    since: now,
    expiresAt: now + CRAVING_DURATION_MS,
  },
});

// On a successful fulfillment: clear the craving, bump the streak +
// fulfilled count, possibly update best streak, and stamp `since` so
// the next craving spawns after the post-fulfill gap.
export const tryFulfillCraving = (
  state: GameState,
  kind: ActionKind,
  now: number,
): { state: GameState; fulfilled: boolean } => {
  if (!state.craving.kind || state.craving.kind !== kind) {
    return { state, fulfilled: false };
  }
  const newStreak = state.craving.streak + 1;
  return {
    state: {
      ...state,
      craving: {
        ...state.craving,
        kind: null,
        since: now,
        expiresAt: 0,
        fulfilledCount: state.craving.fulfilledCount + 1,
        streak: newStreak,
        bestStreak: Math.max(state.craving.bestStreak, newStreak),
      },
    },
    fulfilled: true,
  };
};

// Called when a craving expires unfulfilled. Resets the streak and
// records the miss. The next craving's spawn cooldown is longer.
export const markMiss = (state: GameState, now: number): GameState => ({
  ...state,
  craving: {
    ...state.craving,
    kind: null,
    since: now,
    expiresAt: 0,
    streak: 0,
    misses: state.craving.misses + 1,
  },
});
