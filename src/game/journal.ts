import { GameState, JournalEntry } from './state';

const MAX_ENTRIES = 200;

export const addEntry = (state: GameState, entry: Omit<JournalEntry, 'id'>): GameState => {
  const e: JournalEntry = {
    ...entry,
    id: `j-${entry.at}-${Math.random().toString(36).slice(2, 6)}`,
  };
  const next = [e, ...state.journal].slice(0, MAX_ENTRIES);
  return { ...state, journal: next };
};

// Returns true if a daily letter should be written now (princess writes one
// per local day, in the morning hours).
export const shouldWriteDailyLetter = (state: GameState, now: number): boolean => {
  const last = new Date(state.lastDailyLetterAt);
  const cur = new Date(now);
  const sameDay =
    last.getFullYear() === cur.getFullYear() &&
    last.getMonth() === cur.getMonth() &&
    last.getDate() === cur.getDate();
  if (sameDay) return false;
  const hour = cur.getHours();
  return hour >= 7 && hour < 11;
};

// Hard-coded milestone catalogue. Returns the milestone id triggered by this
// state transition, or null. We only fire a milestone the first time it's hit
// (state.milestones tracks which have already been awarded).
export const checkMilestone = (
  state: GameState,
): { id: string; icon: string; label: string } | null => {
  const milestones: { id: string; icon: string; label: string; when: () => boolean }[] = [
    { id: 'first-coke', icon: '🥤', label: 'first diet coke', when: () => state.cokesAllTime === 1 },
    { id: 'first-jager', icon: '🍷', label: 'first jäger', when: () => state.jagersAllTime === 1 },
    { id: 'first-joint', icon: '🌿', label: 'first joint', when: () => state.jointsAllTime === 1 },
    { id: 'first-flower', icon: '🌻', label: 'first sunflower planted', when: () => state.flowersAllTime === 3 },
    { id: 'ten-flowers', icon: '🌻', label: '10 sunflowers in the garden', when: () => state.flowersAllTime >= 10 },
    { id: 'twenty-five-cokes', icon: '🥤', label: '25 diet cokes', when: () => state.cokesAllTime >= 25 },
    { id: 'ten-jagers', icon: '🍷', label: '10 jägers', when: () => state.jagersAllTime >= 10 },
    { id: 'one-week', icon: '👑', label: 'one whole week of friendship', when: () => Date.now() - state.startedAt >= 7 * 24 * 60 * 60 * 1000 },
    { id: 'two-weeks', icon: '👑', label: 'two weeks together', when: () => Date.now() - state.startedAt >= 14 * 24 * 60 * 60 * 1000 },
    { id: 'thirty-days', icon: '👑', label: 'thirty days. you stayed.', when: () => Date.now() - state.startedAt >= 30 * 24 * 60 * 60 * 1000 },
  ];
  for (const m of milestones) {
    if (state.milestones[m.id]) continue;
    if (m.when()) return { id: m.id, icon: m.icon, label: m.label };
  }
  return null;
};

export const recordMilestone = (state: GameState, id: string, now: number): GameState => ({
  ...state,
  milestones: { ...state.milestones, [id]: now },
});
