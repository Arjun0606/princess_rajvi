import { GameState, Mood, ActionKind, Activity } from '../game/state';

type SaysArgs = {
  state: GameState;
  mood: Mood;
  activity: Activity;
  date: Date;
  lastAction: ActionKind | null;
  minutesAway: number;
};

const FALLBACKS_BY_MOOD: Record<Mood, string[]> = {
  thriving: [
    'i am literally thriving rn',
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
    "time isn't real and neither is the dishwasher",
    "i'm not high YOU'RE high",
  ],
  sassy: [
    "where's my diet coke peasant",
    'serve me. now.',
    'speak ONLY when spoken to',
  ],
  needy: [
    "i've been WAITING. you're late.",
    'the garden is dying. so am i. dramatically.',
    'attend to me immediately',
  ],
  sleepy: [
    'mmm five more minutes',
    'tucking the kingdom in goodnight',
    'princess hours. soft.',
  ],
  okay: [
    'what would you like to bring me',
    'court is in session. you may approach.',
    "i'm bored. entertain me.",
  ],
};

const ACTION_FALLBACKS: Record<ActionKind, string[]> = {
  coke: ['caffeine: deployed', 'aspartame, my beloved', 'the sass meter rises'],
  jager: ["oh god that's strong", 'cheers to my own kingdom', 'one jäger, one princess, perfect'],
  weed: ["oh that's nice actually", 'i am a pretty princess and i am vibing', 'the castle just got SO much bigger'],
  water: ['the sunflowers thank you peasant', 'gardener of the year', 'they LIVE'],
  tap: ['hi.', 'yes?', 'were you summoning me'],
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

const localFallback = (mood: Mood, lastAction: ActionKind | null): string => {
  if (lastAction && Math.random() < 0.7) return pick(ACTION_FALLBACKS[lastAction]);
  return pick(FALLBACKS_BY_MOOD[mood]);
};

const buildPayload = (a: SaysArgs, kind: 'chat' | 'letter' | 'daily' | 'milestone' | 'firstrun', extra?: Record<string, unknown>) => {
  const recentFlowerNames = a.state.garden.slice(-5).map((s) => s.name);
  return {
    context: {
      sass: Math.round(a.state.stats.sass),
      joy: Math.round(a.state.stats.joy),
      vibes: Math.round(a.state.stats.vibes),
      chill: Math.round(a.state.stats.chill),
      drunk: a.state.drunk,
      high: a.state.high,
      mood: a.mood,
      activity: a.activity,
      hour: a.date.getHours(),
      minute: a.date.getMinutes(),
      minutesAway: a.minutesAway,
      lastAction: a.lastAction,
      flowersAllTime: a.state.flowersAllTime,
      cokesAllTime: a.state.cokesAllTime,
      jagersAllTime: a.state.jagersAllTime,
      jointsAllTime: a.state.jointsAllTime,
      daysTogether: Math.floor((Date.now() - a.state.startedAt) / (24 * 60 * 60 * 1000)) + 1,
      recentFlowerNames,
      kind,
      ...(extra ?? {}),
    },
  };
};

const callApi = async (payload: ReturnType<typeof buildPayload>): Promise<string | null> => {
  try {
    const r = await fetch('/api/sass', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { text?: string };
    return data.text ?? null;
  } catch {
    return null;
  }
};

export const fetchSass = async (a: SaysArgs): Promise<string> => {
  const text = await callApi(buildPayload(a, 'chat'));
  return text ?? localFallback(a.mood, a.lastAction);
};

export const fetchLetterOnReturn = async (a: SaysArgs): Promise<string> => {
  const text = await callApi(buildPayload(a, 'letter'));
  return (
    text ??
    [
      `you LEFT me. for ${a.minutesAway} whole minutes.`,
      `the sunflowers (${a.state.garden.slice(-3).map((s) => s.name).join(', ') || 'all of them'}) have been most concerned.`,
      `i drank the jäger by myself. don't ask how much.`,
      `bring snacks immediately or i'm revoking your title.`,
    ].join('\n\n')
  );
};

export const fetchDailyLetter = async (a: SaysArgs): Promise<string> => {
  const text = await callApi(buildPayload(a, 'daily'));
  return (
    text ??
    `good morning my one loyal subject. day ${Math.floor((Date.now() - a.state.startedAt) / (24 * 60 * 60 * 1000)) + 1} of our reign begins. i'd like a diet coke. no thoughts beyond that.`
  );
};

export const fetchMilestoneLetter = async (
  a: SaysArgs,
  milestoneLabel: string,
): Promise<string> => {
  const text = await callApi(buildPayload(a, 'milestone', { milestoneLabel }));
  return text ?? `the kingdom officially recognises: ${milestoneLabel}. you may bow.`;
};

export const fetchFirstRunLetter = async (a: SaysArgs): Promise<string> => {
  const text = await callApi(buildPayload(a, 'firstrun'));
  return (
    text ??
    `oh hello. you've found me.\n\nthis is my castle. that's my sunflower meadow. i live here doing princess things — diet coke, jäger, the occasional joint, watering my girls (the sunflowers, each named).\n\nstay a while. tend to me. i write letters when i feel like it. the diary keeps them all.\n\nlong may we reign. — r 🌻`
  );
};
