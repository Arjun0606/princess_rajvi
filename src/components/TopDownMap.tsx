import { CSSProperties, ReactNode } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
  children?: ReactNode;
  onMapTap?: (xPct: number, yPct: number) => void;
};

// Open cottage-garden overworld in the Pokemon Gold / Stardew Valley
// style. NOT a walled courtyard — a sunny meadow that opens out onto
// rolling sunflower hills at the horizon.
//
// Composition (top to bottom):
//   1. ~14% horizon band: distant sunflower hills, sun/moon, far-off
//      castle silhouette. Strong depth cue.
//   2. Tile-based grass meadow filling the rest. Two alternating greens
//      give it Pokemon-style checker variation.
//   3. Cream stone path: a central medallion with four branches winding
//      out to each of the four stations.
//   4. Decorative micro-tiles scattered across the grass: pixel daisies,
//      pebbles, dandelion tufts, small bushes.
//
// Children (stations, companions, princess) render on top in 0..1 map
// coordinates.

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

const HORIZON_BAND = 0.14; // top portion = sky + distant hills

// Tile size driven by viewport. We don't render an actual tile array — we
// paint the floor with a checker-pattern conic gradient at TILE px size,
// which matches the Pokemon-Gold "two-tone grass" look while staying
// performant on every viewport.
const TILE_PX = 44;

export const TopDownMap = ({ phase, children, onMapTap }: Props) => {
  const handleTap: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!onMapTap) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Princess walks anywhere on the meadow — keep her out of the horizon
    // band and just shy of the bottom edge.
    onMapTap(
      Math.max(0.06, Math.min(0.94, x)),
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
        <Paths />
        {/* Children: stations, fountain, flora, companions, princess */}
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
        <PhaseOverlay phase={phase} />
      </div>
    </div>
  );
};

// Distant rolling hills + sky + sun/moon. The 2.5D depth cue.
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
        bottom: '40%',
        height: '40%',
        background: phase === 'night' ? '#3a2470' : '#7ab8d4',
        clipPath:
          'polygon(0% 70%, 8% 55%, 18% 65%, 28% 50%, 40% 62%, 52% 48%, 64% 60%, 76% 50%, 88% 62%, 100% 56%, 100% 100%, 0% 100%)',
        opacity: 0.7,
      }}
    />
    {/* Mid hills with sunflower meadow */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        background: phase === 'night' ? '#2a1750' : '#86c95a',
        clipPath:
          'polygon(0% 60%, 6% 48%, 14% 58%, 22% 46%, 32% 54%, 44% 44%, 56% 54%, 68% 46%, 80% 56%, 92% 46%, 100% 54%, 100% 100%, 0% 100%)',
      }}
    />
    {/* Closer hill silhouette */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        background: phase === 'night' ? '#1c0f3a' : '#5fa83a',
        clipPath:
          'polygon(0% 70%, 10% 56%, 22% 66%, 36% 52%, 50% 64%, 64% 54%, 78% 64%, 90% 54%, 100% 60%, 100% 100%, 0% 100%)',
      }}
    />
    {/* Sunflower dots scattered on the far hills */}
    {[
      [10, 72], [22, 78], [34, 70], [46, 76], [58, 68], [70, 76], [82, 70], [92, 76],
    ].map(([x, y], i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: 3,
          height: 3,
          background: phase === 'night' ? '#604a8a' : '#ffd84d',
        }}
      />
    ))}
    {/* Distant pink castle silhouette top-right */}
    <div
      style={{
        position: 'absolute',
        right: '8%',
        bottom: '22%',
        width: 36,
        height: 28,
      }}
    >
      <svg viewBox="0 0 36 28" width="100%" height="100%" shapeRendering="crispEdges">
        <rect x="4"  y="14" width="28" height="14" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="2"  y="6"  width="6"  height="22" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="28" y="6"  width="6"  height="22" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        <rect x="14" y="2"  width="8"  height="26" fill={phase === 'night' ? '#3a2470' : '#d99fb2'} />
        {/* Conical roofs */}
        <polygon points="2,6 5,2 8,6"    fill={phase === 'night' ? '#604a8a' : '#ff5d8f'} />
        <polygon points="28,6 31,2 34,6" fill={phase === 'night' ? '#604a8a' : '#ff5d8f'} />
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
            width: 18,
            height: 18,
            background: '#fff5dc',
            borderRadius: '50%',
            boxShadow: '0 0 24px 6px rgba(255,245,220,0.4)',
          }}
        />
        {/* A few stars */}
        {[[20, 18], [44, 12], [62, 22], [78, 8], [88, 26]].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 2,
              height: 2,
              background: '#fff5dc',
              opacity: 0.8 - (i % 2) * 0.3,
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
          top: '34%',
          width: 18,
          height: 18,
          background: '#fff1a8',
          borderRadius: '50%',
          boxShadow: '0 0 28px 8px rgba(255,180,140,0.55)',
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
          top: '36%',
          width: 22,
          height: 22,
          background: '#ffd06b',
          borderRadius: '50%',
          boxShadow: '0 0 36px 12px rgba(255,140,80,0.55)',
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
        width: 16,
        height: 16,
        background: '#fff5b8',
        borderRadius: '50%',
        boxShadow: '0 0 22px 6px rgba(255,240,160,0.4)',
      }}
    />
  );
};

// Tile-grid grass meadow with two-tone Pokemon-style checker.
const Meadow = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${HORIZON_BAND * 100}%`,
      bottom: 0,
      background: `
        linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.06) 100%),
        repeating-conic-gradient(
          #a8e0b1 0% 25%,
          #b9efc1 25% 50%
        )`,
      backgroundSize: `auto, ${TILE_PX}px ${TILE_PX}px`,
    }}
  >
    {/* Grass-blade texture overlay — tiny darker pixel marks across each
        tile, in a 2x2 sub-pattern, to give the grass tactile detail. */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 30%, rgba(80,140,90,0.45) 0.5px, transparent 1.5px),
          radial-gradient(circle at 75% 70%, rgba(80,140,90,0.4)  0.5px, transparent 1.5px),
          radial-gradient(circle at 50% 50%, rgba(80,140,90,0.3)  0.5px, transparent 1px)
        `,
        backgroundSize: `${TILE_PX}px ${TILE_PX}px`,
        pointerEvents: 'none',
      }}
    />
  </div>
);

// Cream stone paths winding out from a central rose medallion to each
// of the four stations. Drawn in SVG so paths can curve naturally and
// scale to any viewport. Stations live at (0.18,0.46), (0.82,0.46),
// (0.20,0.86), (0.80,0.86) — branches arrive at those points.
const Paths = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    width="100%"
    height="100%"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
  >
    <defs>
      <pattern id="path-stones" patternUnits="userSpaceOnUse" width="3" height="3">
        <rect width="3" height="3" fill="#f4ddb0" />
        <rect x="0" y="0" width="1.4" height="1.4" fill="#f7e7c4" />
        <rect x="1.6" y="1.6" width="1.4" height="1.4" fill="#e8c896" />
      </pattern>
    </defs>
    {/* All path branches are drawn as a wide stroke with a darker outline. */}
    <g stroke="#b89052" strokeWidth="8" strokeLinecap="round" fill="none">
      {/* Darker outline beneath the cream stones */}
      <path d="M 50 60 Q 34 54, 18 46" />
      <path d="M 50 60 Q 66 54, 82 46" />
      <path d="M 50 60 Q 30 72, 20 86" />
      <path d="M 50 60 Q 70 72, 80 86" />
      <path d="M 50 60 L 50 22" />
    </g>
    <g
      stroke="url(#path-stones)"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    >
      <path d="M 50 60 Q 34 54, 18 46" />
      <path d="M 50 60 Q 66 54, 82 46" />
      <path d="M 50 60 Q 30 72, 20 86" />
      <path d="M 50 60 Q 70 72, 80 86" />
      <path d="M 50 60 L 50 22" />
    </g>
  </svg>
);

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

// Helper so callers can position elements in 0..1 map coordinates.
export const mapPos = (xPct: number, yPct: number): CSSProperties => ({
  position: 'absolute',
  left: `${xPct * 100}%`,
  top: `${yPct * 100}%`,
});
