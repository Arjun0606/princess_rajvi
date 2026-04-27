import { CSSProperties, ReactNode } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
  children?: ReactNode;
  onMapTap?: (xPct: number, yPct: number) => void;
};

// Procedurally rendered top-down pixel-art map of Princess Rajvi's tiny
// castle courtyard. Designed as a Pokemon Gold / Stardew Valley overworld:
// fully bird's-eye, walkable open center, 4 stations at the corners.
//
// The whole world is a fixed 16:9 aspect-ratio rectangle scaled to fit the
// viewport. All station sprites and the player princess are positioned in
// percentages of map space so we can think of the world in 0..1 coordinates.

const PHASE_OVERLAY: Record<SkyPhase, string> = {
  dawn: 'linear-gradient(180deg, rgba(255,180,180,0.12), rgba(255,200,170,0.06))',
  day: 'linear-gradient(180deg, rgba(255,255,200,0.04), rgba(255,255,200,0))',
  dusk: 'linear-gradient(180deg, rgba(255,140,80,0.16), rgba(255,80,140,0.10))',
  night: 'linear-gradient(180deg, rgba(40,30,90,0.42), rgba(20,10,50,0.5))',
};

export const TopDownMap = ({ phase, children, onMapTap }: Props) => {
  const handleTap: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!onMapTap) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onMapTap(Math.max(0.04, Math.min(0.96, x)), Math.max(0.08, Math.min(0.94, y)));
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#221538',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* The map itself — fixed aspect ratio */}
      <div
        onPointerUp={handleTap}
        data-drop-target="floor"
        style={{
          position: 'relative',
          width: 'min(100vw, calc(100vh * 1.6))',
          height: 'min(100vh, calc(100vw / 1.6))',
          imageRendering: 'pixelated',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <FloorTiles />
        <Walls />
        <Decorations />
        <PhaseOverlay phase={phase} />
        {children}
      </div>
    </div>
  );
};

const FloorTiles = () => (
  <div
    style={{
      position: 'absolute',
      inset: '8% 4% 6%',
      background:
        // Marble tile pattern: warm cream with subtle veining
        `repeating-linear-gradient(45deg,
          #f7d8d8 0 28px,
          #f0c4c4 28px 30px,
          #f7d8d8 30px 58px,
          #ecbcbc 58px 60px),
         linear-gradient(180deg, #ffe7e7 0%, #f0c4c4 100%)`,
      boxShadow:
        'inset 0 0 0 4px #c47a8a, inset 0 0 0 8px #8a4a5a, inset 0 0 60px rgba(0,0,0,0.18)',
    }}
  />
);

const Walls = () => (
  <>
    {/* Top wall */}
    <div
      style={{
        position: 'absolute',
        left: '4%',
        right: '4%',
        top: '2%',
        height: '6%',
        background:
          `repeating-linear-gradient(90deg,
            #d99fb2 0 24px,
            #c47898 24px 26px,
            #d99fb2 26px 50px,
            #b96680 50px 52px),
           linear-gradient(180deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset 0 -2px 0 #8a4a5a, inset 0 2px 0 #ffeaf2, 0 4px 0 rgba(0,0,0,0.2)',
      }}
    />
    {/* Bottom wall */}
    <div
      style={{
        position: 'absolute',
        left: '4%',
        right: '4%',
        bottom: '0%',
        height: '6%',
        background:
          `repeating-linear-gradient(90deg,
            #d99fb2 0 24px,
            #c47898 24px 26px,
            #d99fb2 26px 50px,
            #b96680 50px 52px),
           linear-gradient(180deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset 0 2px 0 #ffeaf2, inset 0 -2px 0 #8a4a5a, 0 4px 0 rgba(0,0,0,0.2)',
      }}
    />
    {/* Left wall */}
    <div
      style={{
        position: 'absolute',
        left: '0%',
        top: '2%',
        bottom: '0%',
        width: '4%',
        background:
          `repeating-linear-gradient(0deg,
            #d99fb2 0 24px,
            #c47898 24px 26px,
            #d99fb2 26px 50px,
            #b96680 50px 52px),
           linear-gradient(90deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset 2px 0 0 #ffeaf2, inset -2px 0 0 #8a4a5a',
      }}
    />
    {/* Right wall */}
    <div
      style={{
        position: 'absolute',
        right: '0%',
        top: '2%',
        bottom: '0%',
        width: '4%',
        background:
          `repeating-linear-gradient(0deg,
            #d99fb2 0 24px,
            #c47898 24px 26px,
            #d99fb2 26px 50px,
            #b96680 50px 52px),
           linear-gradient(270deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset -2px 0 0 #ffeaf2, inset 2px 0 0 #8a4a5a',
      }}
    />
  </>
);

// Decorative non-interactive tile flourishes — grass tufts, rose petals.
const Decorations = () => (
  <>
    {/* Scattered grass tufts as tiny pixel marks */}
    {[
      { x: 22, y: 35 }, { x: 64, y: 28 }, { x: 38, y: 62 }, { x: 78, y: 68 },
      { x: 12, y: 70 }, { x: 86, y: 42 }, { x: 50, y: 50 }, { x: 30, y: 80 },
    ].map((t, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${t.x}%`,
          top: `${t.y}%`,
          width: 4,
          height: 4,
          background: '#3aa84a',
          borderRadius: '50%',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
    ))}
    {/* Pink rose petals scattered */}
    {[
      { x: 18, y: 20 }, { x: 72, y: 78 }, { x: 44, y: 24 }, { x: 60, y: 84 },
    ].map((t, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${t.x}%`,
          top: `${t.y}%`,
          width: 6,
          height: 6,
          background: '#ff5d8f',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);

const PhaseOverlay = ({ phase }: { phase: SkyPhase }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: PHASE_OVERLAY[phase],
      mixBlendMode: phase === 'night' ? 'multiply' : 'overlay',
      pointerEvents: 'none',
    }}
  />
);

// Helper so callers can position elements in 0..1 map coordinates.
export const mapPos = (xPct: number, yPct: number): CSSProperties => ({
  position: 'absolute',
  left: `${xPct * 100}%`,
  top: `${yPct * 100}%`,
});
