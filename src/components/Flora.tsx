import { useEffect, useState } from 'react';

export type FloraKind = 'daisy' | 'bush' | 'pebble' | 'tuft';

type FloraItem = {
  id: string;
  kind: FloraKind;
  x: number;
  y: number;
  // null = present; otherwise timestamp when it was picked. Items respawn
  // 60s after being picked.
  pickedAt: number | null;
};

const RESPAWN_MS = 60_000;

const SEEDS: { kind: FloraKind; x: number; y: number }[] = [
  { kind: 'daisy',  x: 0.12, y: 0.30 },
  { kind: 'daisy',  x: 0.30, y: 0.48 },
  { kind: 'daisy',  x: 0.40, y: 0.70 },
  { kind: 'daisy',  x: 0.62, y: 0.32 },
  { kind: 'daisy',  x: 0.72, y: 0.72 },
  { kind: 'daisy',  x: 0.86, y: 0.50 },
  { kind: 'bush',   x: 0.08, y: 0.62 },
  { kind: 'bush',   x: 0.92, y: 0.66 },
  { kind: 'bush',   x: 0.32, y: 0.78 },
  { kind: 'bush',   x: 0.66, y: 0.78 },
  { kind: 'pebble', x: 0.22, y: 0.40 },
  { kind: 'pebble', x: 0.74, y: 0.42 },
  { kind: 'pebble', x: 0.40, y: 0.82 },
  { kind: 'pebble', x: 0.58, y: 0.84 },
  { kind: 'tuft',   x: 0.18, y: 0.54 },
  { kind: 'tuft',   x: 0.82, y: 0.54 },
  { kind: 'tuft',   x: 0.50, y: 0.30 },
  { kind: 'tuft',   x: 0.50, y: 0.74 },
];

type Props = {
  // Called when player picks something — flora kind + screen position
  // for the floating +1 indicator.
  onPick: (kind: FloraKind, xPct: number, yPct: number) => void;
};

export const Flora = ({ onPick }: Props) => {
  const [items, setItems] = useState<FloraItem[]>(() =>
    SEEDS.map((s, i) => ({ id: `f-${i}`, ...s, pickedAt: null })),
  );

  // Respawn picked items after RESPAWN_MS.
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) =>
        prev.map((it) =>
          it.pickedAt !== null && Date.now() - it.pickedAt > RESPAWN_MS
            ? { ...it, pickedAt: null }
            : it,
        ),
      );
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const pick = (item: FloraItem, e: React.PointerEvent) => {
    e.stopPropagation();
    if (item.pickedAt !== null) return;
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, pickedAt: Date.now() } : it)),
    );
    onPick(item.kind, item.x, item.y);
  };

  return (
    <>
      {items.map((it) => {
        const justPicked =
          it.pickedAt !== null && Date.now() - it.pickedAt < 600;
        if (it.pickedAt !== null && !justPicked) return null;
        return (
          <div
            key={it.id}
            onPointerUp={(e) => pick(it, e)}
            style={{
              position: 'absolute',
              left: `${it.x * 100}%`,
              top: `${it.y * 100}%`,
              transform: 'translate(-50%, -100%)',
              cursor: 'pointer',
              zIndex: 2,
              animation: justPicked ? 'flora-pop 0.5s ease-out forwards' : undefined,
              // Make flora hit-target slightly larger than the sprite for
              // easier mobile tapping.
              padding: 4,
              margin: -4,
            }}
          >
            <FloraSprite kind={it.kind} />
          </div>
        );
      })}
    </>
  );
};

const FloraSprite = ({ kind }: { kind: FloraKind }) => {
  switch (kind) {
    case 'daisy':
      return (
        <svg viewBox="0 0 8 10" width="14" height="18" shapeRendering="crispEdges">
          <rect x="3" y="6" width="1" height="4" fill="#3a8a3a" />
          <rect x="2" y="8" width="1" height="1" fill="#5fc55f" />
          <rect x="4" y="7" width="1" height="1" fill="#5fc55f" />
          <rect x="3" y="2" width="2" height="1" fill="#fff5dc" />
          <rect x="2" y="3" width="4" height="2" fill="#fff5dc" />
          <rect x="3" y="5" width="2" height="1" fill="#fff5dc" />
          <rect x="3" y="3" width="2" height="2" fill="#ffd84d" />
        </svg>
      );
    case 'bush':
      return (
        <svg viewBox="0 0 14 10" width="28" height="20" shapeRendering="crispEdges">
          <ellipse cx="7" cy="8"  rx="6" ry="2" fill="#3a8a3a" />
          <ellipse cx="3" cy="6"  rx="3" ry="3" fill="#5fc55f" />
          <ellipse cx="7" cy="5"  rx="4" ry="3" fill="#5fc55f" />
          <ellipse cx="11" cy="6" rx="3" ry="3" fill="#5fc55f" />
          <ellipse cx="4" cy="5"  rx="2" ry="2" fill="#86d97a" />
          <ellipse cx="9" cy="4"  rx="2" ry="2" fill="#86d97a" />
          <rect x="3" y="4" width="1" height="1" fill="#ff5d8f" />
          <rect x="9" y="3" width="1" height="1" fill="#ff5d8f" />
          <rect x="6" y="6" width="1" height="1" fill="#ff5d8f" />
        </svg>
      );
    case 'pebble':
      return (
        <svg viewBox="0 0 8 4" width="14" height="7" shapeRendering="crispEdges">
          <ellipse cx="4" cy="2" rx="3.5" ry="1.5" fill="#a89888" />
          <ellipse cx="3" cy="1.5" rx="2"  ry="0.8" fill="#c4b8a8" />
        </svg>
      );
    case 'tuft':
      return (
        <svg viewBox="0 0 8 5" width="14" height="9" shapeRendering="crispEdges">
          <rect x="3" y="0" width="1" height="4" fill="#3a8a3a" />
          <rect x="2" y="1" width="1" height="3" fill="#5fc55f" />
          <rect x="4" y="1" width="1" height="3" fill="#5fc55f" />
          <rect x="1" y="2" width="1" height="2" fill="#86d97a" />
          <rect x="5" y="2" width="1" height="2" fill="#86d97a" />
        </svg>
      );
  }
};

// Reaction lines princess says when player picks something. Random pick
// per kind. Kept short so they don't crowd the speech bubble.
export const FLORA_REACTIONS: Record<FloraKind, string[]> = {
  daisy: [
    'oh that one was MINE',
    "i'm telling the bees on you",
    'pretty.',
    'good eye, bestie',
  ],
  bush: [
    'a berry. how RUSTIC.',
    'don\'t eat it raw.',
    'put that in a tart.',
  ],
  pebble: [
    'we\'re collecting rocks now??',
    'ooh shiny',
    'put it in your pocket',
  ],
  tuft: [
    'don\'t pull up the lawn',
    'now the goblins have nothing to nibble',
    'okay grass thief',
  ],
};
