export type Stat = number;

export type ActionKind = 'coke' | 'jager' | 'weed' | 'water' | 'tap';

export type RecentAction = {
  kind: ActionKind;
  at: number;
};

export type Sunflower = {
  id: string;
  name: string;
  plantedAt: number;
  variant: 0 | 1 | 2;
};

// What princess is currently doing.
export type Activity =
  | 'sleeping'
  | 'waking'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'garden'
  | 'cocktail'
  | 'dinner'
  | 'stoned';

// Visual pose. Maps to one of the princess-*.png assets.
export type Pose =
  | 'default'
  | 'coke'
  | 'jager'
  | 'joint'
  | 'sunflower'
  | 'sleep';

// A letter or note in the journal — accumulates over time.
export type JournalEntry = {
  id: string;
  at: number;
  kind: 'daily' | 'return' | 'action' | 'milestone' | 'firstrun';
  text: string;
  // Optional emoji icon shown next to the entry header.
  icon?: string;
};

export type ItemOnTable = {
  id: string;
  kind: 'coke' | 'jager' | 'joint' | 'sunflower';
  appearedAt: number;
  // Position on the table 0..1 horizontal (visual placement).
  spot: number;
};

// Two-way conversation messages with princess. Persisted across sessions
// so a real friendship feels like it accumulates.
export type ChatMessage = {
  id: string;
  at: number;
  role: 'user' | 'princess';
  text: string;
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
  drunk: number;
  high: number;
  cokesAllTime: number;
  jagersAllTime: number;
  jointsAllTime: number;
  flowersAllTime: number;
  recent: RecentAction[];

  // New for the world model:
  pose: Pose;
  poseUntil: number;
  itemsOnTable: ItemOnTable[];
  journal: JournalEntry[];
  lastDailyLetterAt: number;
  milestones: Record<string, number>; // milestone id → timestamp first hit
  chats: ChatMessage[];

  // Foraging — items the player has picked from the meadow flora.
  forage: {
    petals: number;
    berries: number;
    pebbles: number;
    tufts: number;
  };

  // Cravings game: princess randomly wants something on a TIMER. Player
  // has to walk her to the matching station before the timer runs out.
  // Streak tracks consecutive fulfillments; resets on timeout.
  craving: {
    kind: ActionKind | null;
    since: number;         // when this craving started
    expiresAt: number;     // hard deadline; if Date.now() > this, miss
    fulfilledCount: number;// total cravings fulfilled all-time
    streak: number;        // current consecutive-fulfillment streak
    bestStreak: number;    // highest streak ever
    misses: number;        // total times princess timed out unfulfilled
  };
};

export const MAX_STAT = 100;
export const MIN_STAT = 0;
export const MAX_BUZZ = 4;

const SUNFLOWER_NAMES = [
  'doris', 'mathilda', 'tiny tony', 'percy', 'agatha',
  'beatrix', 'lulu', 'opal', 'maeve', 'celeste',
  'esme', 'fenton', 'gwen', 'ivy', 'juno',
];

let nameIdx = 0;
export const nextSunflowerName = () => SUNFLOWER_NAMES[nameIdx++ % SUNFLOWER_NAMES.length]!;

export const initialState = (now: number): GameState => ({
  stats: { sass: 70, joy: 70, vibes: 50, chill: 50 },
  garden: [
    { id: 'seed-1', name: 'doris',    plantedAt: now - 1000 * 60 * 60 * 12, variant: 0 },
    { id: 'seed-2', name: 'mathilda', plantedAt: now - 1000 * 60 * 60 * 24, variant: 1 },
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
  pose: 'default',
  poseUntil: 0,
  itemsOnTable: [],
  journal: [],
  lastDailyLetterAt: 0,
  milestones: {},
  chats: [],
  forage: { petals: 0, berries: 0, pebbles: 0, tufts: 0 },
  craving: {
    kind: null,
    since: 0,
    expiresAt: 0,
    fulfilledCount: 0,
    streak: 0,
    bestStreak: 0,
    misses: 0,
  },
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
