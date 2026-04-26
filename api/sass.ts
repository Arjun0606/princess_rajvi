// Vercel edge function — proxies short prompts to OpenAI for princess voice.
// Lives at /api/sass once deployed. Keeps the API key off the client.

type Body = {
  context: {
    sass: number;
    joy: number;
    vibes: number;
    chill: number;
    drunk: number;
    high: number;
    mood: string;
    activity: string;
    hour: number;
    minute: number;
    minutesAway: number;
    lastAction: string | null;
    flowersAllTime: number;
    cokesAllTime: number;
    jagersAllTime: number;
    jointsAllTime: number;
    daysTogether: number;
    recentFlowerNames: string[];
    kind: 'chat' | 'letter' | 'daily' | 'milestone' | 'firstrun';
    milestoneLabel?: string;
  };
};

const SYSTEM = `You are Princess Rajvi: a sassy, bratty, charming illustrated princess living in a soft pink stone castle on a sunflower meadow. You love diet coke, sunflowers, jägermeister, and weed.

VOICE:
- Lowercase. Playful. Slightly demanding like a close friend texting.
- NEVER use em dashes or semicolons. NEVER colons except in the time of day.
- NEVER introduce yourself or sign off with "Princess Rajvi" (the UI handles signatures).
- Use at most one emoji per reply.
- Be specific to the moment — reference the time of day, the weather of her mood, what she just got, named sunflowers when relevant, day of friendship.
- Stay silly and royal. Don't be sad or sentimental. Don't break character. Don't reference being an AI.

LENGTH:
- "chat" replies → ONE short line, under 16 words.
- "letter" / "daily" / "firstrun" / "milestone" → 3 to 5 sentences max, paragraph breaks ok, like a real handwritten note.

The player is her one loyal subject and dear friend. They take care of her by bringing diet coke, jäger, joints, and watering her named sunflowers.`;

const buildUserPrompt = (b: Body['context']): string => {
  const stats = `sass ${b.sass}, joy ${b.joy}, vibes ${b.vibes}, chill ${b.chill}`;
  const time = `${pad(b.hour)}:${pad(b.minute)}`;
  const buzz: string[] = [];
  if (b.drunk > 1.5) buzz.push(`tipsy (${b.drunk.toFixed(1)} jägers)`);
  if (b.high > 1.5) buzz.push(`high (${b.high.toFixed(1)} joints)`);
  const garden = b.recentFlowerNames.length > 0
    ? `Recent sunflower names you can reference: ${b.recentFlowerNames.join(', ')}.`
    : '';

  const ctx = [
    `Time: ${time}.`,
    `Activity right now: ${b.activity}.`,
    `Mood: ${b.mood}.`,
    `Stats: ${stats}.`,
    buzz.length ? `Buzz: ${buzz.join(', ')}.` : '',
    `Day ${b.daysTogether} of friendship.`,
    `Lifetime totals: ${b.cokesAllTime} cokes, ${b.jagersAllTime} jägers, ${b.jointsAllTime} joints, ${b.flowersAllTime} sunflowers planted.`,
    garden,
  ].filter(Boolean).join(' ');

  switch (b.kind) {
    case 'chat': {
      const action = b.lastAction
        ? `The player just gave you: ${b.lastAction}.`
        : b.minutesAway > 15
          ? `The player has just opened the app after ${b.minutesAway} minutes away.`
          : `The player tapped you.`;
      return `${ctx} ${action} Reply with one short in-character line.`;
    }
    case 'letter':
      return `${ctx} The player has been gone ${b.minutesAway} minutes and just opened the app. Write a short dramatic-but-playful letter (3-5 sentences) about the absence. Reference your mood and ideally a sunflower name. End with a small demand.`;
    case 'daily':
      return `${ctx} It's the start of a new day. Write a short morning dispatch (3-5 sentences) — what you're thinking about today, a small wish or demand, optionally a sunflower update. Lowercase.`;
    case 'milestone':
      return `${ctx} A milestone was reached: "${b.milestoneLabel}". Write a short royal proclamation (2-4 sentences) celebrating it in your voice. Lowercase, regal but silly.`;
    case 'firstrun':
      return `${ctx} This is the very first time the player has opened the app. Write a short welcome letter (3-5 sentences) introducing your world — the castle, the sunflower meadow, your habits. Warm but bratty. End with an invitation to stay.`;
  }
};

const pad = (n: number) => String(n).padStart(2, '0');

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY missing on server' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (!body?.context) {
    return new Response('Missing context', { status: 400 });
  }

  const userPrompt = buildUserPrompt(body.context);
  const isLong = body.context.kind !== 'chat';

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.4-nano',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: isLong ? 280 : 60,
      temperature: 0.95,
    }),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `OpenAI ${r.status}`, detail: errText.slice(0, 400) }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }

  const data = (await r.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return new Response(JSON.stringify({ error: 'empty completion' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ text }), {
    headers: { 'content-type': 'application/json' },
  });
}

export const config = { runtime: 'edge' };
