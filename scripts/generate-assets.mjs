#!/usr/bin/env node
// Generates all 16 pixel-art assets for Princess Rajvi via OpenAI's
// gpt-image-2. Reads the API key from OPENAI_API_KEY env var. Saves PNGs
// into public/art/ using the canonical filenames the app expects.
//
//   OPENAI_API_KEY=sk-... node scripts/generate-assets.mjs
//   OPENAI_API_KEY=sk-... node scripts/generate-assets.mjs --only princess-default
//
// Re-run with --only <basename> to regenerate a single asset.

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error('ERROR: set OPENAI_API_KEY in env.');
  process.exit(1);
}

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const OUT_DIR = path.resolve(process.cwd(), 'public/art');

const STYLE_PREAMBLE = `
A pixel art illustration in the style of 16-bit SNES / GBA era games like Stardew Valley, Eastward, Sea of Stars, and Animal Crossing GBA. CRISP SHARP PIXELS. NO anti-aliasing. NO blur. NO smooth gradients. NO photoreal shading. Strong dark outlines on every figure. Limited cozy palette (12-24 colors): soft pinks, sunflower yellow, gold, sage green, warm cream, dusk lavender. Cute kawaii chibi-leaning proportions. Render as a true pixel art sprite (not a smooth illustration of pixel art).

CHARACTER: Princess Rajvi — a young south asian princess with chunky pixel strands of long dark brown hair, big round expressive pixel eyes, a small three-point gold crown with a single pink gem, a soft pink puffy-sleeved princess dress with white frilly collar, a bright sunflower tucked behind her right ear. Cheerful, slightly bratty default expression. Tiny stubby arms and legs.

WORLD: A small private terrace of a pink stone castle. Pale rose marble floor. Curved ornate pink balustrade. Endless sunflower meadow on rolling hills below. Marble side table on the right. Sunflower planter on the left. Pink rose vines on the right wall. Castle's pink turrets visible upper right.
`.trim();

const SCENE = (timeOfDay, palette, princessPose) =>
  `${STYLE_PREAMBLE}\n\nSCENE: A pink castle terrace at ${timeOfDay}. ${palette}. Sharp 16-bit pixel art, no anti-aliasing, no smooth gradients, no photo-real shading. Stardew Valley / Eastward / Sea of Stars aesthetic.\n\nThe scene shows Princess Rajvi (south asian princess described above) ${princessPose} on a pale rose marble terrace. Curved pink stone balustrade behind her overlooking a sunflower meadow. A small marble side table on the right. A planter of sunflowers on the left. Pink rose vines on the right wall. Distant pink castle turrets in the upper right. Mobile portrait composition with princess centered, slightly toward the lower third.`;

const SPRITE = (description) =>
  `${STYLE_PREAMBLE}\n\nSPRITE: ${description}. Full body, transparent background, character isolated and centered. Render as a true pixel art sprite with sharp edges and no anti-aliasing. The character takes up roughly 80% of the frame height.`;

const ITEM = (description) =>
  `${STYLE_PREAMBLE.split('\n')[0]}\n\nITEM ICON: ${description}. Single object, transparent background. Pixel art inventory icon, dark outline, sharp pixels, no anti-aliasing. Centered in frame.`;

const UI = (description) =>
  `${STYLE_PREAMBLE.split('\n')[0]}\n\nUI ELEMENT: ${description}. Transparent background. Pixel art, dark outline, sharp pixels.`;

const ASSETS = [
  // ---- Backgrounds with princess (4 time-of-day variants) ----
  {
    file: 'bg-dawn.png',
    size: '1024x1024',
    prompt: SCENE(
      'dawn (early morning)',
      'Soft peach and rose-pink dawn sky with a small chunky pixel sun rising over the distant horizon. Marble floor catches the first warm light. Warm peach / rose / pale-pink palette',
      'just waking up, stretching gently with arms above her head, sleepy soft smile',
    ),
  },
  {
    file: 'bg-day.png',
    size: '1024x1024',
    prompt: SCENE(
      'midday',
      'Bright cheerful blue pixel sky with chunky pixel white clouds. Sunflower meadow in full bloom. Marble floor in golden midday light. Bright cyan / yellow / green palette',
      'standing centered with hands clasped in front of her, gentle smile, holding a single bright sunflower',
    ),
  },
  {
    file: 'bg-dusk.png',
    size: '1024x1024',
    prompt: SCENE(
      'sunset (cocktail hour)',
      'Sky is a vivid pixel gradient of orange-pink-lavender with chunky pink clouds, sun setting on the horizon. Sunflowers glow gold in the last light. Warm orange / pink / coral palette',
      'standing centered, mischievous grin with a small wink, raising a tiny shot glass of dark green Jägermeister with both hands toward the viewer in a toast',
    ),
  },
  {
    file: 'bg-night.png',
    size: '1024x1024',
    prompt: SCENE(
      'night',
      'Deep navy purple pixel night sky with a chunky pixel full moon and scattered pixel stars. Fireflies in the meadow. Warm candlelight pours from inside the castle. Cool purple / midnight blue palette with warm yellow accents',
      'sitting cross-legged on the floor, eyes half-closed in a deeply relaxed expression, holding a tiny lit joint between her fingers with a small grey smoke curl rising',
    ),
  },

  // ---- Princess sprites (1024x1024, transparent BG) ----
  {
    file: 'princess-default.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi standing facing the viewer in a relaxed pose, tiny stubby arms at her sides, gentle smile',
    ),
  },
  {
    file: 'princess-coke.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi standing, holding up a tiny pixel red-and-silver soda can to her mouth taking a sip, eyes happily closed, small blush pixels on her cheeks',
    ),
  },
  {
    file: 'princess-jager.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi standing, holding a tiny pixel dark green bottle with an orange label near her chest with both hands, mischievous grin, blush pixels on cheeks, one eye winking',
    ),
  },
  {
    file: 'princess-joint.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi sitting cross-legged on the floor, eyes half-closed in a relaxed expression, holding a tiny rolled herbal cigarette with a small grey pixel smoke curl rising from it, sleepy smile',
    ),
  },
  {
    file: 'princess-sunflower.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi standing, holding a single big pixel sunflower close to her face with both hands, eyes closed in a tender quiet smile',
    ),
  },
  {
    file: 'princess-sleep.png',
    size: '1024x1024',
    prompt: SPRITE(
      'Princess Rajvi curled up asleep on a small velvet floor cushion, dress draped softly around her, tiny pixel "Z" floating above her head, peaceful expression',
    ),
  },

  // ---- Items (1024x1024, transparent BG) ----
  {
    file: 'item-coke.png',
    size: '1024x1024',
    prompt: ITEM(
      'A pixel art Diet Coke aluminium can standing upright. Silver body with a horizontal red stripe around the middle, white "Diet Coke" wordmark inside the stripe. Pull tab at the top. Pixel art inventory icon, dark outline, sharp pixels, transparent background',
    ),
  },
  {
    file: 'item-jager.png',
    size: '1024x1024',
    prompt: ITEM(
      'A pixel art tall slim dark green glass bottle, bright orange rectangular label with an antlered stag emblem on it and the text "JÄGER", silver foil cap on top. Pixel art inventory icon, dark outline, sharp pixels, transparent background',
    ),
  },
  {
    file: 'item-joint.png',
    size: '1024x1024',
    prompt: ITEM(
      'A pixel art rolled herbal cigarette lying horizontally, white paper, twisted at one lit end with a small glowing orange ember pixel and a tiny grey pixel smoke curl rising. Pixel art inventory icon, dark outline, sharp pixels, transparent background',
    ),
  },
  {
    file: 'item-sunflower.png',
    size: '1024x1024',
    prompt: ITEM(
      'A pixel art single sunflower viewed from the front, golden yellow petals around a brown seed center, two green leaves on a curved green stem. Pixel art inventory icon, dark outline, sharp pixels, transparent background',
    ),
  },

  // ---- UI (1024x1024, transparent BG) ----
  {
    file: 'ui-letter.png',
    size: '1024x1024',
    prompt: UI(
      'An aged cream parchment letter, slightly rolled at the corners with subtle paper texture, a tiny pink wax seal stamped with a heart at the top. The parchment is BLANK with no text or marks (text is overlaid in code). Pixel art icon, dark outline, transparent background',
    ),
  },
  {
    file: 'ui-journal.png',
    size: '1024x1024',
    prompt: UI(
      'A small leather-bound journal lying closed at a slight 3/4 angle. Dusty pink leather cover with a pressed pixel sunflower on the front and a thin gold ribbon bookmark trailing from the bottom. No text on the cover. Pixel art icon, dark outline, transparent background',
    ),
  },
];

// ---- runner ----------------------------------------------------------------

const ENDPOINT = 'https://api.openai.com/v1/images/generations';

const MODEL = process.env.IMAGE_MODEL || 'dall-e-3';

async function generate(asset) {
  const body = {
    model: MODEL,
    prompt: asset.prompt,
    size: asset.size,
    n: 1,
    ...(MODEL === 'dall-e-3' ? { response_format: 'b64_json', quality: 'standard' } : {}),
  };
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errText = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${errText.slice(0, 400)}`);
  }
  const data = await r.json();
  const item = data.data?.[0];
  if (!item) throw new Error(`No image returned: ${JSON.stringify(data).slice(0, 200)}`);
  // gpt-image-2 returns b64_json by default
  if (item.b64_json) {
    const buf = Buffer.from(item.b64_json, 'base64');
    const out = path.join(OUT_DIR, asset.file);
    await writeFile(out, buf);
    return out;
  }
  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Fetching url ${item.url} failed: ${imgRes.status}`);
    const ab = await imgRes.arrayBuffer();
    const out = path.join(OUT_DIR, asset.file);
    await writeFile(out, Buffer.from(ab));
    return out;
  }
  throw new Error('No b64_json or url in response');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const todo = ONLY
    ? ASSETS.filter((a) => a.file.startsWith(ONLY))
    : ASSETS;
  if (todo.length === 0) {
    console.error(`No assets matched --only=${ONLY}`);
    process.exit(1);
  }
  console.log(`Generating ${todo.length} asset(s) → ${OUT_DIR}`);
  let ok = 0;
  let fail = 0;
  for (const a of todo) {
    const start = Date.now();
    process.stdout.write(`  ${a.file} … `);
    try {
      await generate(a);
      const elapsed = Math.round((Date.now() - start) / 100) / 10;
      console.log(`✓ (${elapsed}s)`);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      fail++;
    }
    // small breather to be nice to rate limits
    await new Promise((res) => setTimeout(res, 800));
  }
  console.log(`\nDone — ${ok} ok, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
