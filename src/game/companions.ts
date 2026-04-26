import { GameState } from './state';

export type CompanionId = 'bird' | 'corgi' | 'cat';

export type CompanionMeta = {
  id: CompanionId;
  unlockDays: number;
  emoji: string;
  name: string;
  blurb: string;
};

export const COMPANIONS: CompanionMeta[] = [
  { id: 'bird',  unlockDays: 7,  emoji: '🐦', name: 'Pigeon', blurb: 'a small pigeon arrived with a tiny letter' },
  { id: 'corgi', unlockDays: 14, emoji: '🐕', name: 'Lord Bigsby', blurb: 'a corgi has decided he lives here now' },
  { id: 'cat',   unlockDays: 21, emoji: '🐈', name: 'Duchess', blurb: 'a regal cat has accepted the position of court advisor' },
];

export const unlockedCompanions = (state: GameState): CompanionMeta[] => {
  const days = (Date.now() - state.startedAt) / (24 * 60 * 60 * 1000);
  return COMPANIONS.filter((c) => days >= c.unlockDays);
};

// Returns the next companion that just became available but hasn't been
// announced (recorded as a milestone). Used to fire a one-time letter.
export const newlyAvailableCompanion = (state: GameState): CompanionMeta | null => {
  const days = (Date.now() - state.startedAt) / (24 * 60 * 60 * 1000);
  for (const c of COMPANIONS) {
    const milestoneId = `companion-${c.id}`;
    if (days >= c.unlockDays && !state.milestones[milestoneId]) {
      return c;
    }
  }
  return null;
};
