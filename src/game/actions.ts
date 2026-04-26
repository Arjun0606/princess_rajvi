import { GameState, RecentAction, Sunflower, clamp } from './state';

const remember = (state: GameState, kind: RecentAction['kind'], now: number): RecentAction[] => {
  const next = [...state.recent, { kind, at: now }];
  return next.slice(-8);
};

export const giveCoke = (state: GameState, now: number): GameState => ({
  ...state,
  stats: {
    ...state.stats,
    sass: clamp(state.stats.sass + 28),
    chill: clamp(state.stats.chill - 4),
  },
  cokesAllTime: state.cokesAllTime + 1,
  recent: remember(state, 'coke', now),
});

export const giveJager = (state: GameState, now: number): GameState => ({
  ...state,
  stats: {
    ...state.stats,
    vibes: clamp(state.stats.vibes + 32),
    chill: clamp(state.stats.chill + 4),
  },
  drunk: Math.min(state.drunk + 1, 4),
  jagersAllTime: state.jagersAllTime + 1,
  recent: remember(state, 'jager', now),
});

export const giveWeed = (state: GameState, now: number): GameState => ({
  ...state,
  stats: {
    ...state.stats,
    chill: clamp(state.stats.chill + 30),
    sass: clamp(state.stats.sass - 4),
  },
  high: Math.min(state.high + 1, 4),
  jointsAllTime: state.jointsAllTime + 1,
  recent: remember(state, 'weed', now),
});

const pickSpot = (garden: Sunflower[]): number => {
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = 0.05 + Math.random() * 0.9;
    if (garden.every((s) => Math.abs(s.x - x) > 0.07)) return x;
  }
  return 0.05 + Math.random() * 0.9;
};

export const water = (state: GameState, now: number): GameState => {
  const ungrown = state.garden.filter(
    (s) => now - s.plantedAt < 1000 * 60 * 60 * 6
  );
  const newFlower: Sunflower = {
    id: `seed-${now}-${Math.random().toString(36).slice(2, 6)}`,
    plantedAt: now,
    x: pickSpot(state.garden),
    variant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
  };
  // Cap garden at 14 flowers — older ones rotate out so it never gets overwhelming.
  const trimmed = state.garden.length >= 14 ? state.garden.slice(1) : state.garden;
  return {
    ...state,
    stats: { ...state.stats, joy: clamp(state.stats.joy + 18) },
    garden: ungrown.length === 0 ? [...trimmed, newFlower] : trimmed,
    flowersAllTime: state.flowersAllTime + (ungrown.length === 0 ? 1 : 0),
    recent: remember(state, 'water', now),
  };
};

export const tap = (state: GameState, now: number): GameState => ({
  ...state,
  recent: remember(state, 'tap', now),
});
