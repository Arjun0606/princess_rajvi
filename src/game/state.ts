export type Stat = number;

export type ActionKind = 'coke' | 'jager' | 'weed' | 'water' | 'tap';

export type RecentAction = {
  kind: ActionKind;
  at: number;
};

export type Sunflower = {
  id: string;
  plantedAt: number;
  x: number; // 0..1 across the garden width
  variant: 0 | 1 | 2;
  giant?: boolean;
};

export type GameState = {
  stats: {
    sass: Stat;
    joy: Stat;
    vibes: Stat;
    chill: Stat;
  };
  garden: Sunflower[];
  startedAt: number;
  lastSeen: number;
  lastTick: number;
  drunk: number; // 0..3+ visible wobble
  high: number;  // 0..3+ stoned filter
  cokesAllTime: number;
  jagersAllTime: number;
  jointsAllTime: number;
  flowersAllTime: number;
  recent: RecentAction[];
};

export const MAX_STAT = 100;
export const MIN_STAT = 0;
export const MAX_BUZZ = 4;

export const initialState = (now: number): GameState => ({
  stats: { sass: 70, joy: 70, vibes: 50, chill: 50 },
  garden: [
    { id: 'seed-1', plantedAt: now - 1000 * 60 * 60 * 12, x: 0.18, variant: 0 },
    { id: 'seed-2', plantedAt: now - 1000 * 60 * 60 * 24, x: 0.78, variant: 1 },
  ],
  startedAt: now,
  lastSeen: now,
  lastTick: now,
  drunk: 0,
  high: 0,
  cokesAllTime: 0,
  jagersAllTime: 0,
  jointsAllTime: 0,
  flowersAllTime: 2,
  recent: [],
});

export const clamp = (n: number, lo = MIN_STAT, hi = MAX_STAT) =>
  Math.max(lo, Math.min(hi, n));

export type Mood =
  | 'thriving'
  | 'drunk'
  | 'stoned'
  | 'sassy'
  | 'needy'
  | 'sleepy'
  | 'okay';

export const moodFor = (s: GameState, hourOfDay: number): Mood => {
  if (s.drunk >= 2.5) return 'drunk';
  if (s.high >= 2.5) return 'stoned';
  const lows = Object.values(s.stats).filter((v) => v < 25).length;
  if (lows >= 2) return 'needy';
  const avg = (s.stats.sass + s.stats.joy + s.stats.vibes + s.stats.chill) / 4;
  if (avg > 80) return 'thriving';
  if (hourOfDay >= 23 || hourOfDay < 6) return 'sleepy';
  if (s.stats.sass > 80) return 'sassy';
  return 'okay';
};
