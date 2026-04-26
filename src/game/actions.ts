import { GameState, RecentAction, Sunflower, ItemOnTable, clamp, nextSunflowerName } from './state';

const POSE_HOLD_MS = 5_000;

const remember = (state: GameState, kind: RecentAction['kind'], now: number): RecentAction[] => {
  const next = [...state.recent, { kind, at: now }];
  return next.slice(-8);
};

const placeOnTable = (state: GameState, kind: ItemOnTable['kind'], now: number): ItemOnTable[] => {
  const item: ItemOnTable = {
    id: `tbl-${now}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    appearedAt: now,
    spot: Math.random() * 0.8 + 0.1,
  };
  return [...state.itemsOnTable.slice(-3), item];
};

export const giveCoke = (state: GameState, now: number): GameState => ({
  ...state,
  stats: {
    ...state.stats,
    sass: clamp(state.stats.sass + 28),
    chill: clamp(state.stats.chill - 4),
  },
  cokesAllTime: state.cokesAllTime + 1,
  pose: 'coke',
  poseUntil: now + POSE_HOLD_MS,
  itemsOnTable: placeOnTable(state, 'coke', now),
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
  pose: 'jager',
  poseUntil: now + POSE_HOLD_MS,
  itemsOnTable: placeOnTable(state, 'jager', now),
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
  pose: 'joint',
  poseUntil: now + POSE_HOLD_MS * 2,
  itemsOnTable: placeOnTable(state, 'joint', now),
  recent: remember(state, 'weed', now),
});

export const water = (state: GameState, now: number): GameState => {
  const ungrown = state.garden.filter(
    (s) => now - s.plantedAt < 1000 * 60 * 60 * 6
  );
  const newFlower: Sunflower = {
    id: `seed-${now}-${Math.random().toString(36).slice(2, 6)}`,
    name: nextSunflowerName(),
    plantedAt: now,
    variant: Math.floor(Math.random() * 3) as 0 | 1 | 2,
  };
  const trimmed = state.garden.length >= 14 ? state.garden.slice(1) : state.garden;
  const planted = ungrown.length === 0;
  return {
    ...state,
    stats: { ...state.stats, joy: clamp(state.stats.joy + 18) },
    garden: planted ? [...trimmed, newFlower] : trimmed,
    flowersAllTime: state.flowersAllTime + (planted ? 1 : 0),
    pose: 'sunflower',
    poseUntil: now + POSE_HOLD_MS,
    recent: remember(state, 'water', now),
  };
};

export const tap = (state: GameState, now: number): GameState => ({
  ...state,
  recent: remember(state, 'tap', now),
});
