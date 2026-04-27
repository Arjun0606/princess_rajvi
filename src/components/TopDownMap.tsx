import { CSSProperties, ReactNode } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
  children?: ReactNode;
  onMapTap?: (xPct: number, yPct: number) => void;
};

// Dense Stardew-style cottage garden. The previous version's diagonal
// SVG paths read as a pentagram instead of a path system, so all paths
// are gone. Instead, each station sits on a small dirt patch, and the
// rest of the meadow is packed with rocks, twigs, weeds, grass clumps,
// and small flower spots — Stardew-density decoration.
//
// Layers (back to front):
//   1. Sky band (~12% top)
//   2. Tile-grid grass meadow (two-tone checker + grass-blade texture)
//   3. Dirt patches under each station
//   4. Decorative debris: rocks, twigs, weed sprites, scattered flowers
//   5. Children: fountain, flora, critters, stations, companions, princess
//   6. Phase tint overlay

const SKY: Record<SkyPhase, string> = {
  dawn: 'linear-gradient(180deg, #ffd6c4 0%, #ffb4c4 60%, #f49ab0 100%)',
  day:  'linear-gradient(180deg, #b6e0ff 0%, #d4ecff 60%, #ffeaf2 100%)',
  dusk: 'linear-gradient(180deg, #ff8a4a 0%, #ff5d8f 60%, #6a2a6a 100%)',
  night:'linear-gradient(180deg, #1c1140 0%, #2a1a55 50%, #3a2470 100%)',
};

const PHASE_TINT: Record<SkyPhase, string> = {
  dawn:  'linear-gradient(180deg, rgba(255,180,160,0.10), rgba(255,200,170,0.04))',
  day:   'linear-gradient(180deg, rgba(255,255,200,0.04), rgba(255,255,200,0))',
  dusk:  'linear-gradient(180deg, rgba(255,140,80,0.18), rgba(255,80,140,0.12))',
  night: 'linear-gradient(180deg, rgba(40,30,90,0.42), rgba(20,10,50,0.5))',
};

const HORIZON_BAND = 0.12;
const TILE_PX = 36;

// Dirt patches under each station so they look like cleared earth, not
// stickers on grass. Coordinates match Stations.STATIONS (top-left top-right
// bottom-left bottom-right).
const DIRT_PATCHES: { x: number; y: number; w: number; h: number }[] = [
  { x: 0.20, y: 0.42, w: 80, h: 36 },
  { x: 0.80, y: 0.42, w: 60, h: 32 },
  { x: 0.22, y: 0.82, w: 76, h: 30 },
  { x: 0.78, y: 0.82, w: 76, h: 30 },
  // Central fountain dirt patch
  { x: 0.50, y: 0.62, w: 70, h: 24 },
];

export const TopDownMap = ({ phase, children, onMapTap }: Props) => {
  const handleTap: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!onMapTap) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onMapTap(
      Math.max(0.05, Math.min(0.95, x)),
      Math.max(HORIZON_BAND + 0.06, Math.min(0.94, y)),
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: SKY[phase],
        overflow: 'hidden',
      }}
    >
      <div
        onPointerUp={handleTap}
        data-drop-target="floor"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Horizon phase={phase} />
        <Meadow />
        <DirtPatches />
        <DenseDecor />
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
        <PhaseOverlay phase={phase} />
      </div>
    </div>
  );
};

const Horizon = ({ phase }: { phase: SkyPhase }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: `${HORIZON_BAND * 100}%`,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    <Celestial phase={phase} />
    {/* Far hills */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
        background: phase === 'night' ? '#2a1750' : '#86c95a',
        clipPath:
          'polygon(0% 60%, 6% 48%, 14% 58%, 22% 46%, 32% 54%, 44% 44%, 56% 54%, 68% 46%, 80% 56%, 92% 46%, 100% 54%, 100% 100%, 0% 100%)',
      }}
    />
    {/* Closer hill */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
        background: phase === 'night' ? '#1c0f3a' : '#5fa83a',
        clipPath:
          'polygon(0% 70%, 10% 56%, 22% 66%, 36% 52%, 50% 64%, 64% 54%, 78% 64%, 90% 54%, 100% 60%, 100% 100%, 0% 100%)',
      }}
    />
    {/* Distant pink castle silhouette top-right */}
    <div
      style={{
        position: 'absolute',
        right: '8%',
        bottom: '20%',
        width: 26,
        height: 20,
      }}
    >
      <svg viewBox="0 0 36 28" width="100%" height="100%" shapeRendering="crispEdges">
        <rect x="4"  y="14" width="28" height="14" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="2"  y="6"  width="6"  height="22" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="28" y="6"  width="6"  height="22" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="14" y="2"  width="8"  height="26" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <polygon points="2,6 5,2 8,6"     fill={phase === 'night' ? '#604a8a' : '#ff5d8f'} />
        <polygon points="28,6 31,2 34,6"  fill={phase === 'night' ? '#604a8a' : '#ff5d8f'} />
        <polygon points="14,2 18,-2 22,2" fill={phase === 'night' ? '#604a8a' : '#ff5d8f'} />
      </svg>
    </div>
  </div>
);

const Celestial = ({ phase }: { phase: SkyPhase }) => {
  if (phase === 'night') {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            right: '12%',
            top: '14%',
            width: 14,
            height: 14,
            background: '#fff5dc',
            borderRadius: '50%',
            boxShadow: '0 0 18px 4px rgba(255,245,220,0.4)',
          }}
        />
        {[[18, 24], [42, 14], [60, 28], [78, 10], [88, 32]].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 2,
              height: 2,
              background: '#fff5dc',
              opacity: 0.7,
            }}
          />
        ))}
      </>
    );
  }
  if (phase === 'dawn') {
    return (
      <div
        style={{
          position: 'absolute',
          left: '14%',
          top: '36%',
          width: 14,
          height: 14,
          background: '#fff1a8',
          borderRadius: '50%',
          boxShadow: '0 0 22px 6px rgba(255,180,140,0.55)',
        }}
      />
    );
  }
  if (phase === 'dusk') {
    return (
      <div
        style={{
          position: 'absolute',
          right: '20%',
          top: '38%',
          width: 16,
          height: 16,
          background: '#ffd06b',
          borderRadius: '50%',
          boxShadow: '0 0 26px 8px rgba(255,140,80,0.55)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        right: '14%',
        top: '14%',
        width: 12,
        height: 12,
        background: '#fff5b8',
        borderRadius: '50%',
        boxShadow: '0 0 18px 5px rgba(255,240,160,0.4)',
      }}
    />
  );
};

const Meadow = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${HORIZON_BAND * 100}%`,
      bottom: 0,
      background: `
        repeating-conic-gradient(
          #a8e0b1 0% 25%,
          #b9efc1 25% 50%
        )`,
      backgroundSize: `${TILE_PX}px ${TILE_PX}px`,
    }}
  >
    {/* Grass-blade radial dot texture: tiny darker pixel marks per tile */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 30%, rgba(80,140,90,0.55) 0.5px, transparent 1.5px),
          radial-gradient(circle at 75% 70%, rgba(80,140,90,0.5)  0.5px, transparent 1.5px),
          radial-gradient(circle at 60% 20%, rgba(80,140,90,0.4)  0.5px, transparent 1px),
          radial-gradient(circle at 30% 80%, rgba(80,140,90,0.4)  0.5px, transparent 1px)
        `,
        backgroundSize: `${TILE_PX}px ${TILE_PX}px`,
        pointerEvents: 'none',
      }}
    />
  </div>
);

// Soft brown patches of cleared dirt under each station — gives them a
// grounded place to sit, instead of looking pasted on grass.
const DirtPatches = () => (
  <>
    {DIRT_PATCHES.map((p, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${p.x * 100}%`,
          top: `${p.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: p.w,
          height: p.h,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, #c98640 0%, #a96820 60%, #5b3826 100%)',
          opacity: 0.55,
          boxShadow: 'inset 0 0 4px rgba(91,56,38,0.6)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    ))}
  </>
);

// DENSITY: rocks, twigs, weeds, grass clumps, scattered tiny flowers,
// fallen petals — many of them, all decorative. Distribution is hand-
// placed to avoid clumping near stations.
type Decor = { kind: 'rock' | 'twig' | 'weed' | 'grass' | 'flower' | 'mushroom'; x: number; y: number };

const DECOR: Decor[] = [
  // Top band of meadow (between horizon and top stations)
  { kind: 'grass',    x: 0.06, y: 0.20 },
  { kind: 'flower',   x: 0.12, y: 0.24 },
  { kind: 'rock',     x: 0.30, y: 0.18 },
  { kind: 'weed',     x: 0.40, y: 0.22 },
  { kind: 'grass',    x: 0.52, y: 0.18 },
  { kind: 'flower',   x: 0.60, y: 0.24 },
  { kind: 'twig',     x: 0.68, y: 0.20 },
  { kind: 'grass',    x: 0.78, y: 0.20 },
  { kind: 'rock',     x: 0.92, y: 0.22 },
  { kind: 'mushroom', x: 0.34, y: 0.26 },
  // Left side
  { kind: 'rock',     x: 0.08, y: 0.36 },
  { kind: 'weed',     x: 0.12, y: 0.52 },
  { kind: 'twig',     x: 0.06, y: 0.66 },
  { kind: 'grass',    x: 0.10, y: 0.74 },
  { kind: 'flower',   x: 0.06, y: 0.50 },
  { kind: 'rock',     x: 0.04, y: 0.58 },
  // Right side
  { kind: 'grass',    x: 0.92, y: 0.36 },
  { kind: 'rock',     x: 0.96, y: 0.50 },
  { kind: 'weed',     x: 0.88, y: 0.56 },
  { kind: 'twig',     x: 0.94, y: 0.66 },
  { kind: 'flower',   x: 0.90, y: 0.74 },
  { kind: 'mushroom', x: 0.94, y: 0.42 },
  // Middle band (avoid fountain area at y=0.55-0.7)
  { kind: 'weed',     x: 0.32, y: 0.52 },
  { kind: 'rock',     x: 0.40, y: 0.74 },
  { kind: 'grass',    x: 0.30, y: 0.70 },
  { kind: 'twig',     x: 0.62, y: 0.74 },
  { kind: 'flower',   x: 0.68, y: 0.70 },
  { kind: 'grass',    x: 0.70, y: 0.52 },
  { kind: 'weed',     x: 0.42, y: 0.56 },
  // Bottom band
  { kind: 'grass',    x: 0.10, y: 0.92 },
  { kind: 'rock',     x: 0.40, y: 0.94 },
  { kind: 'twig',     x: 0.50, y: 0.92 },
  { kind: 'weed',     x: 0.60, y: 0.94 },
  { kind: 'grass',    x: 0.92, y: 0.92 },
  { kind: 'mushroom', x: 0.36, y: 0.92 },
];

const DenseDecor = () => (
  <>
    {DECOR.map((d, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${d.x * 100}%`,
          top: `${d.y * 100}%`,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.2))',
        }}
      >
        <DecorSprite kind={d.kind} />
      </div>
    ))}
  </>
);

const DecorSprite = ({ kind }: { kind: Decor['kind'] }) => {
  switch (kind) {
    case 'rock':
      return (
        <svg viewBox="0 0 12 8" width="20" height="14" shapeRendering="crispEdges">
          <ellipse cx="6" cy="6" rx="6" ry="2.4" fill="#5a4a4a" />
          <ellipse cx="6" cy="4" rx="5.5" ry="3" fill="#888" />
          <ellipse cx="5" cy="3.5" rx="3" ry="1.5" fill="#aaa" />
          <rect x="3"  y="3" width="1" height="1" fill="#ddd" />
          <rect x="7"  y="2" width="1" height="1" fill="#ddd" />
        </svg>
      );
    case 'twig':
      return (
        <svg viewBox="0 0 14 6" width="22" height="10" shapeRendering="crispEdges">
          <rect x="1" y="3" width="12" height="1" fill="#6b3a20" />
          <rect x="1" y="4" width="12" height="1" fill="#3a2010" />
          <rect x="3" y="2" width="2" height="1" fill="#6b3a20" />
          <rect x="9" y="2" width="2" height="1" fill="#6b3a20" />
          <rect x="11" y="1" width="1" height="1" fill="#6b3a20" />
        </svg>
      );
    case 'weed':
      return (
        <svg viewBox="0 0 8 12" width="14" height="20" shapeRendering="crispEdges">
          <rect x="3" y="4"  width="2" height="8" fill="#3a8a3a" />
          <rect x="1" y="6"  width="2" height="2" fill="#5fc55f" />
          <rect x="5" y="5"  width="2" height="2" fill="#5fc55f" />
          <rect x="2" y="9"  width="1" height="2" fill="#86d97a" />
          <rect x="5" y="9"  width="1" height="2" fill="#86d97a" />
          <rect x="3" y="1"  width="2" height="3" fill="#86d97a" />
        </svg>
      );
    case 'grass':
      return (
        <svg viewBox="0 0 10 6" width="18" height="11" shapeRendering="crispEdges">
          <rect x="1" y="3" width="1" height="3" fill="#3a8a3a" />
          <rect x="3" y="2" width="1" height="4" fill="#5fc55f" />
          <rect x="5" y="1" width="1" height="5" fill="#3a8a3a" />
          <rect x="7" y="2" width="1" height="4" fill="#5fc55f" />
          <rect x="9" y="3" width="1" height="3" fill="#3a8a3a" />
        </svg>
      );
    case 'flower':
      return (
        <svg viewBox="0 0 7 8" width="12" height="14" shapeRendering="crispEdges">
          <rect x="3" y="4" width="1" height="4" fill="#3a8a3a" />
          <rect x="2" y="6" width="1" height="1" fill="#5fc55f" />
          <rect x="4" y="6" width="1" height="1" fill="#5fc55f" />
          <rect x="2" y="2" width="1" height="2" fill="#ff7aa9" />
          <rect x="4" y="2" width="1" height="2" fill="#ff7aa9" />
          <rect x="3" y="1" width="1" height="1" fill="#ff5d8f" />
          <rect x="3" y="4" width="1" height="0" fill="#ff5d8f" />
          <rect x="3" y="3" width="1" height="1" fill="#ffd84d" />
        </svg>
      );
    case 'mushroom':
      return (
        <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges">
          <ellipse cx="4" cy="4" rx="4" ry="2" fill="#c43a3a" />
          <rect x="2" y="2" width="1" height="1" fill="#fff" />
          <rect x="5" y="3" width="1" height="1" fill="#fff" />
          <rect x="3" y="6" width="2" height="2" fill="#fff5dc" />
          <rect x="3" y="5" width="2" height="1" fill="#e8d8a8" />
        </svg>
      );
  }
};

const PhaseOverlay = ({ phase }: { phase: SkyPhase }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: PHASE_TINT[phase],
      mixBlendMode: phase === 'night' ? 'multiply' : 'overlay',
      pointerEvents: 'none',
      zIndex: 9,
    }}
  />
);

export const mapPos = (xPct: number, yPct: number): CSSProperties => ({
  position: 'absolute',
  left: `${xPct * 100}%`,
  top: `${yPct * 100}%`,
});
