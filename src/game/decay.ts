import { GameState, clamp } from './state';

// Per-hour decay rates. Negative = stat falls.
const RATES = {
  sass: -10,
  joy: -8,
  vibes: -18, // jager wears off fast
  chill: -10,
};

const BUZZ_DECAY_PER_HOUR = 1.2; // drunk + high fade

// When she's stoned, her other stats decay slower (she doesn't care).
const stonedMultiplier = (high: number) => (high > 1.5 ? 0.55 : 1);

export const tick = (state: GameState, now: number): GameState => {
  const elapsedMs = now - state.lastTick;
  if (elapsedMs <= 0) return { ...state, lastTick: now };
  const hours = elapsedMs / (1000 * 60 * 60);
  const mult = stonedMultiplier(state.high);

  const stats = {
    sass: clamp(state.stats.sass + RATES.sass * hours * mult),
    joy: clamp(state.stats.joy + RATES.joy * hours * mult),
    vibes: clamp(state.stats.vibes + RATES.vibes * hours * mult),
    chill: clamp(state.stats.chill + RATES.chill * hours * mult),
  };

  const drunk = Math.max(0, state.drunk - BUZZ_DECAY_PER_HOUR * hours);
  const high = Math.max(0, state.high - BUZZ_DECAY_PER_HOUR * hours);

  return { ...state, stats, drunk, high, lastTick: now };
};
