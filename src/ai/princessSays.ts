import { GameState, Mood, ActionKind } from '../game/state';

type SaysArgs = {
  state: GameState;
  mood: Mood;
  date: Date;
  lastAction: ActionKind | null;
  minutesAway: number;
};

const FALLBACKS_BY_MOOD: Record<Mood, string[]> = {
  thriving: [
    'i am literally thriving right now',
    "we're in our peak princess era",
    "okay i'm kind of glowing tho",
  ],
  drunk: [
    'okay ONE more jäger then we sleep',
    'the room is doing the thing again',
    'i love you. wait who are you',
  ],
  stoned: [
    'have you ever like.. looked at a sunflower',
    'time isn\'t real and neither is the dishwasher',
    'i\'m not high YOU\'RE high',
  ],
  sassy: [
    "where's my diet coke peasant",
    'serve me. now.',
    'speak ONLY when spoken to',
  ],
  needy: [
    'i\'ve been WAITING. you\'re late.',
    'the garden is dying. so am i. dramatically.',
    'attend to me immediately',
  ],
  sleepy: [
    'mmm five more minutes',
    'tucking the kingdom in goodnight',
    'i\'m soooo sleepy princess hours',
  ],
  okay: [
    'what would you like to bring me',
    'court is in session. you may approach.',
    'i\'m bored. entertain me.',
  ],
};

const ACTION_FALLBACKS: Record<ActionKind, string[]> = {
  coke: ['caffeine: deployed', 'the sass meter rises', 'aspartame, my beloved'],
  jager: ['oh god that\'s strong', 'cheers to my own kingdom', 'one jäger, one princess, perfect'],
  weed: ['oh that\'s nice actually', 'i\'m a pretty princess and i am vibing', 'the castle just got SO much bigger'],
  water: ['the sunflowers thank you peasant', 'gardener of the year award', 'they LIVE'],
  tap: ['hi.', 'yes?', 'were you summoning me'],
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

const localFallback = (mood: Mood, lastAction: ActionKind | null): string => {
  if (lastAction && Math.random() < 0.7) return pick(ACTION_FALLBACKS[lastAction]);
  return pick(FALLBACKS_BY_MOOD[mood]);
};

const buildPayload = (a: SaysArgs, isLetter = false) => ({
  context: {
    sass: Math.round(a.state.stats.sass),
    joy: Math.round(a.state.stats.joy),
    vibes: Math.round(a.state.stats.vibes),
    chill: Math.round(a.state.stats.chill),
    drunk: a.state.drunk,
    high: a.state.high,
    mood: a.mood,
    hour: a.date.getHours(),
    minute: a.date.getMinutes(),
    minutesAway: a.minutesAway,
    lastAction: a.lastAction,
    flowersAllTime: a.state.flowersAllTime,
    cokesAllTime: a.state.cokesAllTime,
    jagersAllTime: a.state.jagersAllTime,
    jointsAllTime: a.state.jointsAllTime,
    isLetter,
  },
});

export const fetchSass = async (a: SaysArgs): Promise<string> => {
  try {
    const r = await fetch('/api/sass', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildPayload(a)),
    });
    if (!r.ok) throw new Error(String(r.status));
    const data = (await r.json()) as { text?: string };
    if (!data.text) throw new Error('empty');
    return data.text;
  } catch {
    return localFallback(a.mood, a.lastAction);
  }
};

export const fetchLetter = async (a: SaysArgs): Promise<string> => {
  try {
    const r = await fetch('/api/sass', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildPayload(a, true)),
    });
    if (!r.ok) throw new Error(String(r.status));
    const data = (await r.json()) as { text?: string };
    if (!data.text) throw new Error('empty');
    return data.text;
  } catch {
    return [
      `you LEFT me. for ${a.minutesAway} whole minutes.`,
      `the sunflowers have wilted. metaphorically. (i didn't water them.)`,
      `i drank the jäger by myself. don't ask how much.`,
      `bring snacks immediately or i'm revoking your title.`,
    ].join('\n\n');
  }
};
