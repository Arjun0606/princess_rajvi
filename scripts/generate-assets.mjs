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

const SCENE = (timeOfDay, palette) =>
  `Pixel art game map, 16-bit Pokemon Gold/Silver overworld + Stardew Valley farm, looked at FROM DIRECTLY OVERHEAD (bird's-eye, top-down camera angle, like a paper game board). NO 3D wall rendering, NO horizon, NO sky visible (we are looking down), NO character art.\n\nTime of day: ${timeOfDay}. ${palette}.\n\nThis is a SINGLE SCREEN GAME MAP showing the ground of Princess Rajvi's tiny pink castle courtyard, viewed straight down:\n- A square area of pale rose marble FLOOR TILES fills the center (large open empty walkable area).\n- TOP and BOTTOM edges: pink stone walls drawn as thin strips of texture, seen FROM ABOVE (just the top of the wall, no 3D side).\n- TOP-LEFT corner: a small square sunflower garden plot (brown dirt rectangle with rows of sunflowers seen FROM ABOVE — just yellow petal-circles).\n- TOP-RIGHT corner: a round marble fountain seen FROM ABOVE (concentric circles, water in middle).\n- BOTTOM-LEFT corner: a round table with two chairs seen FROM ABOVE (circle + small squares).\n- BOTTOM-RIGHT corner: a soft cushion / floor pillow on a small rug seen FROM ABOVE (square with pattern).\n- Stone path tiles connecting the corners through the center.\n- Decorative grass tufts and rose petals scattered in tile gaps.\n\n16-bit pixel art, sharp pixels, no anti-aliasing, limited palette of soft pinks and gold. Composition: 1792x1024 landscape.\n\nABSOLUTELY NO PEOPLE, NO PRINCESS, NO HUMANS, NO CHARACTERS, NO FACES, NO FIGURES. Empty map only. NO 3D WALLS. NO HORIZON.`;

const SPRITE = (description) =>
  `Mobile game character sprite, finished and shipped: ${description}.\n\nSTYLE: 16-bit / SNES / GBA / Stardew Valley pixel art. CRISP SHARP PIXELS, NO anti-aliasing, NO blur, NO smooth gradients. Strong dark outlines on the character. Limited cozy palette (12-24 colors): soft pinks, sunflower yellow, gold, sage green, warm cream.\n\nCHARACTER: Princess Rajvi — a young south asian princess. Long flowing dark brown hair (chunky pixel strands). Big round expressive eyes. Small gold three-point crown with a single pink gem. Soft pink puffy-sleeved princess dress with a white frilly collar that falls to her ankles. A bright sunflower tucked behind her right ear. Cheerful, slightly bratty default expression. Tiny stubby chibi arms and legs.\n\nFRAMING — STRICT: the image contains ONLY the character, full body, large, centered, filling 80% of the frame height. SOLID flat pastel background (a plain lavender or mint, like #cbb6e8). ABSOLUTELY NONE OF THESE IN THE IMAGE: color palette swatches, color picker bars, reference grids, graph paper, design notes, scale references, multiple views or rotations of the character, tiled patterns, decorative borders, frame inserts, callouts, text labels, watermarks, sunflower decorations around the borders, additional characters, additional small objects on the background. JUST the single character on a uniform pastel field. The image looks like a polished asset already shipped in an app store game, not a designer's reference sheet.`;

const ITEM = (description) =>
  `Mobile game inventory icon: a single pixel art sprite of ${description}, used in a finished shipping mobile game.\n\nThe image is a finished icon on a solid uniform pastel-purple background (#cbb6e8). The sprite is large and centered, dominating the frame. Crisp sharp 16-bit pixels, dark outline, limited palette of 8-16 cozy colors, Stardew Valley style. No anti-aliasing, no blur.\n\nThe finished icon contains exactly one thing: the sprite itself, alone, on the uniform pastel field. Nothing else fills the canvas — the background is empty pastel from edge to edge except where the sprite sits. The image must look like a polished asset already shipped in an app store game, not a work-in-progress reference sheet.`;

const UI = (description) =>
  `${STYLE_PREAMBLE.split('\n')[0]}\n\nUI ELEMENT: ${description}. Transparent background. Pixel art, dark outline, sharp pixels.`;

const ASSETS = [
  // ---- Empty backgrounds (4 time-of-day variants, landscape) ----
  {
    file: 'bg-dawn.png',
    size: '1792x1024',
    prompt: SCENE(
      'dawn (early morning)',
      'Soft peach and rose-pink dawn sky with a small chunky pixel sun rising over the distant horizon. Marble floor catches the first warm light. Warm peach / rose / pale-pink palette',
    ),
  },
  {
    file: 'bg-day.png',
    size: '1792x1024',
    prompt: SCENE(
      'midday',
      'Bright cheerful blue pixel sky with chunky pixel white clouds. Sunflower meadow in full bloom. Marble floor in golden midday light. Bright cyan / yellow / green palette',
    ),
  },
  {
    file: 'bg-dusk.png',
    size: '1792x1024',
    prompt: SCENE(
      'sunset',
      'Sky is a vivid pixel gradient of orange-pink-lavender with chunky pink clouds, sun setting on the horizon. Sunflowers glow gold in the last light. Warm orange / pink / coral palette',
    ),
  },
  {
    file: 'bg-night.png',
    size: '1792x1024',
    prompt: SCENE(
      'night',
      'Deep navy purple pixel night sky with a chunky pixel full moon and scattered pixel stars. Fireflies in the meadow. Warm candlelight pours from inside the castle. Cool purple / midnight blue palette with warm yellow accents',
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
