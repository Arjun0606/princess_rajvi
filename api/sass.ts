// Vercel serverless function — proxies a single short prompt to OpenAI.
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
    hour: number;
    minute: number;
    minutesAway: number;
    lastAction: string | null;
    flowersAllTime: number;
    cokesAllTime: number;
    jagersAllTime: number;
    jointsAllTime: number;
    isLetter?: boolean;
  };
};

const SYSTEM = `You are Princess Rajvi: a sassy, bratty, charming pixel-art princess in a pink castle. You love diet coke, sunflowers, jägermeister, and weed. You speak to your one loyal subject (the player) in lowercase, playfully demanding, like a close friend texting. NEVER use em dashes or semicolons. NEVER introduce yourself. Use at most one emoji. Keep replies short (under 18 words for chat, under 60 for letters). Be specific to the moment — reference the time of day, what they just gave you, or what's running low. Don't be sad or sentimental. Stay silly and royal.`;

const buildUserPrompt = (b: Body['context']): string => {
  if (b.isLetter) {
    return `Write a short letter (3-5 sentences max) from princess to her subject who has been gone for ${b.minutesAway} minutes. Stats are: sass ${b.sass}, joy ${b.joy}, vibes ${b.vibes}, chill ${b.chill}. Reference the abandonment dramatically but playfully. The garden has ${b.flowersAllTime} sunflowers planted total. End the letter with a demand. Lowercase, no em dashes.`;
  }
  const parts: string[] = [];
  parts.push(`Time: ${pad(b.hour)}:${pad(b.minute)}.`);
  parts.push(`Mood: ${b.mood}.`);
  parts.push(`Stats — sass ${b.sass}, joy ${b.joy}, vibes ${b.vibes}, chill ${b.chill}.`);
  if (b.drunk > 1.5) parts.push(`She is tipsy (${b.drunk.toFixed(1)} jägers in).`);
  if (b.high > 1.5) parts.push(`She is high (${b.high.toFixed(1)} joints in).`);
  if (b.lastAction) parts.push(`Player just gave her: ${b.lastAction}.`);
  if (!b.lastAction && b.minutesAway > 15)
    parts.push(`Player just opened the app after ${b.minutesAway} minutes away.`);
  if (!b.lastAction && b.minutesAway <= 15)
    parts.push(`Player tapped princess.`);
  parts.push(`Reply with one short line in character.`);
  return parts.join(' ');
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
  const isLetter = body.context.isLetter === true;

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
      max_tokens: isLetter ? 220 : 60,
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
