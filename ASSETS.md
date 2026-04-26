# Princess Rajvi — Asset Brief (PIXEL ART)

16 pixel-art images to generate via ChatGPT image gen. Drop the resulting PNGs into [public/art/](public/art/) using the exact filenames listed below.

**Reference vibe:** Stardew Valley, Animal Crossing (GBA/DS), Eastward, Sea of Stars, modern indie pixel art. Cute, chunky, expressive, palette-limited. NOT chunky MS-Paint blocks. NOT anime watercolor. Tamagotchi-coded but rich.

---

## Step 0 — Paste this into ChatGPT FIRST (sets the style)

```
We are going to generate a series of 16-bit / SNES-era pixel art assets for a small mobile tamagotchi-style game. EVERY image must be in this style. Be ruthlessly consistent.

STYLE:
- 16-bit pixel art. SNES / GBA / Stardew Valley / Animal Crossing era.
- Crisp sharp pixels. NO anti-aliasing. NO blur. NO smooth gradients. NO photo-real shading. NO watercolor. NO 3D render.
- Limited palette per image (12-24 colors). Cozy kawaii vibes — soft pinks, sunflower yellow, gold, sage green, warm cream.
- Strong dark outlines on characters and key objects.
- Cute chibi-leaning proportions. Big head, small body for the princess.
- Image must read as a SPRITE, not an illustration of a sprite.

CHARACTER REFERENCE — PRINCESS RAJVI:
A young south asian princess. Long flowing dark brown hair (chunky pixel strands). Big round expressive eyes. A small gold crown with three points and a single pink gem. A puffy-sleeved soft pink princess dress with a white frilly collar that falls to her ankles. A bright sunflower tucked behind her right ear. Cheerful and slightly bratty default expression. Tiny stubby arms and legs (chibi proportions).

WORLD REFERENCE — THE TERRACE:
A small private balcony of a pink stone castle at sunset. A pale rose marble floor. A curved ornate pink balustrade overlooking an endless sunflower meadow on rolling hills. A small marble side table on the right. A planter of sunflowers on the left. Pink rose vines climbing the right wall and the railing. The castle's pink turrets visible in the upper right. Cozy, magical, golden-hour vibes.

I'll now ask for each image one by one. Use these references CONSISTENTLY across all 16. Same princess, same terrace, same world. Confirm understanding.
```

---

## Backgrounds (4)

Full pixel-art scene paintings. **No princess in them.** Aspect ratio **1024×1792 (portrait)** — but tell ChatGPT "render as if it's a 144×256 pixel scene scaled up cleanly with nearest-neighbour, NO blur." Save as PNG.

### 1 — `bg-dawn.png`
> The terrace at dawn (early morning). Soft peach and rose-pink sky with a small pixel sun rising over the distant horizon of sunflower fields. Marble floor catches the first warm light. The rose vines and balustrade silhouetted. Pixel-art style, 16-bit SNES / Stardew Valley aesthetic, no anti-aliasing, sharp pixels, palette of soft warm pinks/peach/lavender. No people.

### 2 — `bg-day.png`
> The same terrace at midday. Bright cheerful blue pixel sky with a few chunky white pixel clouds. Sunflower meadow in full bloom stretching to the horizon. Marble floor washed in golden light. 16-bit pixel art, Stardew Valley vibe, sharp pixels, palette of bright pinks/blues/yellows/greens. No people.

### 3 — `bg-dusk.png`
> The same terrace at sunset. Sky is a gradient of orange-pink-lavender pixels with chunky pink clouds. The pixel sun setting behind the meadow. Sunflowers glow gold in the last light. 16-bit pixel art, sharp pixels, warm dusk palette. No people.

### 4 — `bg-night.png`
> The same terrace at night. Deep navy purple pixel sky with a chunky pixel full moon and scattered pixel stars. A few firefly pixels glowing in the meadow. Marble floor lit by warm candlelight from inside the castle. 16-bit pixel art, sharp pixels, cool moonlit palette. No people.

---

## Princess Rajvi pixel sprites (6)

Full-body character sprites, isolated. **Transparent background.** Aspect ratio **1024×1024** but tell ChatGPT "render as a 64×64 pixel-art sprite scaled up with nearest-neighbour to fill the canvas." Strong dark outline. PNG with alpha.

### 5 — `princess-default.png`
> Pixel-art sprite of Princess Rajvi standing facing the viewer in a relaxed pose, tiny stubby arms at her sides, gentle smile. 16-bit SNES / Stardew Valley sprite. Sharp pixels, no anti-aliasing, dark outline. Transparent background.

### 6 — `princess-coke.png`
> Pixel-art sprite of Princess Rajvi standing, holding up a tiny pixel Diet Coke can to her mouth taking a sip, eyes closed in a happy expression, small blush pixels on her cheeks. 16-bit sprite, sharp pixels, transparent background.

### 7 — `princess-jager.png`
> Pixel-art sprite of Princess Rajvi standing, holding a tiny pixel green Jägermeister bottle near her chest with both hands, mischievous grin, blush pixels on cheeks, one eye winking. 16-bit sprite, transparent background.

### 8 — `princess-joint.png`
> Pixel-art sprite of Princess Rajvi sitting cross-legged on the floor, eyes half-closed in a deeply relaxed expression, holding a tiny pixel lit joint with a small grey smoke pixel curl rising from it, sleepy smile. 16-bit sprite, transparent background.

### 9 — `princess-sunflower.png`
> Pixel-art sprite of Princess Rajvi standing, holding a single big pixel sunflower close to her face with both hands, eyes closed in a tender quiet smile. 16-bit sprite, transparent background.

### 10 — `princess-sleep.png`
> Pixel-art sprite of Princess Rajvi curled up asleep on a small velvet floor cushion, dress draped softly around her, tiny pixel "Z" floating above her head, peaceful expression. 16-bit sprite, transparent background.

---

## Items (4)

Single isolated objects. **Transparent background.** Aspect ratio **1024×1024**. PNG with alpha. Pixel art icon style — like a Stardew Valley inventory icon. Render as a 32×32 sprite scaled up.

### 11 — `item-coke.png`
> Pixel-art icon of a Diet Coke aluminium can standing upright. Silver body with the iconic red horizontal stripe around the middle and the white "Diet Coke" wordmark inside the stripe. Dark outline. Tiny pixel highlight. 16-bit Stardew Valley inventory-icon style. Transparent background.

### 12 — `item-jager.png`
> Pixel-art icon of a Jägermeister bottle standing upright. Tall slim dark green glass bottle. Bright orange label with antlered stag emblem and "JÄGERMEISTER" text. Silver foil cap. Dark outline. 16-bit inventory-icon style. Transparent background.

### 13 — `item-joint.png`
> Pixel-art icon of a single lit joint lying horizontally. White rolled paper, twisted at the lit end with a small glowing orange ember pixel and a tiny grey smoke pixel curling upward. Dark outline. 16-bit inventory-icon style. Transparent background.

### 14 — `item-sunflower.png`
> Pixel-art icon of a single sunflower viewed from the front. Bright golden-yellow petals around a brown seed center, two green leaves on a curved green stem. Dark outline. 16-bit inventory-icon style. Transparent background.

---

## UI (2)

### 15 — `ui-letter.png`
> Pixel-art icon of an aged cream parchment letter, slightly rolled at the corners, a tiny pink wax seal with a pixel heart at the top center. The parchment is BLANK — no text on it (text will be added in code). 16-bit pixel art, dark outline. Transparent background. 1024×1024.

### 16 — `ui-journal.png`
> Pixel-art icon of a small leather-bound journal lying closed. Dusty pink leather cover with a tiny pressed pixel sunflower on the front and a thin gold ribbon bookmark trailing from the bottom. No text. 16-bit pixel art inventory icon, dark outline. Transparent background. 1024×1024.

---

## Where to put them when done

Drop all 16 files (with the exact filenames above) into:

```
~/princess-rajvi/public/art/
```

That's it — the code will pick them up automatically.

## Calibration tip

Generate ONE princess sprite first (`princess-default.png`) and one background (`bg-dusk.png`) and check both before generating the rest. Style consistency across the 16 matters more than any single image being perfect — if the first ones aren't crisp pixel art (e.g. ChatGPT cheats and gives "an illustration that looks like pixel art" with anti-aliasing), reword the prompt with stronger emphasis on "no anti-aliasing, sharp pixel grid, nearest-neighbour scaling."

## What about the gorgeous watercolor dusk image?

Save it somewhere — it could become a launch screen or App Store / sharing image later. But it's not the in-game art.
