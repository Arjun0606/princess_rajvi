import { GameState, initialState } from './state';

const KEY = 'princess-rajvi-v2';

export const loadState = (): GameState => {
  if (typeof window === 'undefined') return initialState(Date.now());
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Migrate from v1 if present, else start fresh.
      const v1 = localStorage.getItem('princess-rajvi-v1');
      if (v1) {
        try {
          const parsed = JSON.parse(v1);
          const fresh = initialState(Date.now());
          return { ...fresh, ...parsed, journal: [], itemsOnTable: [], pose: 'default', poseUntil: 0, milestones: {}, lastDailyLetterAt: 0 };
        } catch {
          return initialState(Date.now());
        }
      }
      return initialState(Date.now());
    }
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const fresh = initialState(Date.now());
    return {
      ...fresh,
      ...parsed,
      stats: { ...fresh.stats, ...(parsed.stats ?? {}) },
      garden: parsed.garden ?? fresh.garden,
      recent: parsed.recent ?? [],
      journal: parsed.journal ?? [],
      itemsOnTable: parsed.itemsOnTable ?? [],
      milestones: parsed.milestones ?? {},
      chats: parsed.chats ?? [],
      forage: { ...fresh.forage, ...(parsed.forage ?? {}) },
      craving: { ...fresh.craving, ...(parsed.craving ?? {}) },
    };
  } catch {
    return initialState(Date.now());
  }
};

export const saveState = (s: GameState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // quota or private mode — ignore
  }
};
