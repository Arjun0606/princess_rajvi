import { GameState, clamp } from './state';
import { activityFor, ambientPerHour } from './routine';

const RATES = {
  sass: -10,
  joy: -8,
  vibes: -18,
  chill: -10,
};

const BUZZ_DECAY_PER_HOUR = 1.2;

const stonedMultiplier = (high: number) => (high > 1.5 ? 0.55 : 1);

export const tick = (state: GameState, now: number): GameState => {
  const elapsedMs = now - state.lastTick;
  if (elapsedMs <= 0) return { ...state, lastTick: now };
  const hours = elapsedMs / (1000 * 60 * 60);
  const mult = stonedMultiplier(state.high);
  const activity = activityFor(new Date(now).getHours());
  const ambient = ambientPerHour(activity);

  const stats = {
    sass: clamp(state.stats.sass + (RATES.sass + (ambient.sass ?? 0)) * hours * mult),
    joy: clamp(state.stats.joy + (RATES.joy + (ambient.joy ?? 0)) * hours * mult),
    vibes: clamp(state.stats.vibes + (RATES.vibes + (ambient.vibes ?? 0)) * hours * mult),
    chill: clamp(state.stats.chill + (RATES.chill + (ambient.chill ?? 0)) * hours * mult),
  };

  const drunk = Math.max(0, state.drunk - BUZZ_DECAY_PER_HOUR * hours);
  const high = Math.max(0, state.high - BUZZ_DECAY_PER_HOUR * hours);

  // Empty cans/bottles vanish from the table after 30 min so it doesn't pile up.
  const TABLE_TTL = 1000 * 60 * 30;
  const itemsOnTable = state.itemsOnTable.filter((i) => now - i.appearedAt < TABLE_TTL);

  // Pose reverts to default after a triggered pose's hold expires.
  const pose = now > state.poseUntil ? 'default' : state.pose;

  return {
    ...state,
    stats,
    drunk,
    high,
    lastTick: now,
    itemsOnTable,
    pose,
  };
};
