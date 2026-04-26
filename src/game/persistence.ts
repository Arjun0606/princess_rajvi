import { GameState, initialState } from './state';

const KEY = 'princess-rajvi-v1';

export const loadState = (): GameState => {
  if (typeof window === 'undefined') return initialState(Date.now());
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState(Date.now());
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const fresh = initialState(Date.now());
    return {
      ...fresh,
      ...parsed,
      stats: { ...fresh.stats, ...(parsed.stats ?? {}) },
      garden: parsed.garden ?? fresh.garden,
      recent: parsed.recent ?? [],
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
