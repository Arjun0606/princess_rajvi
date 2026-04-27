import { CSSProperties, ReactNode } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
  children?: ReactNode;
  onMapTap?: (xPct: number, yPct: number) => void;
};

// 2.5D pixel-art overworld in the Pokemon Gold / Stardew Valley vein.
// What makes it 2.5D vs. 2D top-down:
//   - The scene is composed in horizontal bands: a slim sky band above the
//     back wall lets you see the meadow beyond, then the back wall has a
//     visible TOP and FRONT face (real height), then the tile floor, then
//     the bottom railing also rendered with a top + front face.
//   - Stations (fridge, table, cushion, garden plot) are drawn from a
//     3/4 oblique perspective so they read as objects sitting ON the floor,
//     not stickers stuck to it.
//   - All upright objects (princess, companions, stations) cast a soft
//     drop-shadow on the floor below them, anchoring them in the world.
//
// Everything is positioned in 0..1 map coordinates so callers (Stations,
// WalkingPrincess, MapCompanions) just say "I'm at (0.78, 0.22)" and the
// renderer puts them in the right spot.

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

// Layout proportions of the scene, top to bottom.
const SKY_BAND      = 0.10; // distant meadow visible above the back wall
const BACK_TOP_BAND = 0.04; // sun-lit top edge of back wall
const BACK_FACE     = 0.08; // shaded front face of back wall
const RAIL_TOP_BAND = 0.03; // top edge of front balustrade
const RAIL_FACE     = 0.06; // shaded front face of front balustrade
// Floor occupies whatever's left between the back wall and the railing.

export const TopDownMap = ({ phase, children, onMapTap }: Props) => {
  const handleTap: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!onMapTap) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onMapTap(Math.max(0.08, Math.min(0.92, x)), Math.max(0.32, Math.min(0.86, y)));
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: SKY[phase],
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Map container — fills viewport. All children position themselves
          via 0..1 map coordinates relative to this box. */}
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
        <BackWall />
        <TileFloor />
        <FrontRail />
        <SideWalls />
        <PhaseOverlay phase={phase} />
        {/* Children (stations, companions, princess) render on the floor
            and above the side walls, but below the front rail. */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
            {children}
          </div>
        </div>
        {/* Front rail painted ON TOP of children so the railing occludes
            the princess's feet when she stands at the very bottom. */}
        <FrontRailOverlay />
      </div>
    </div>
  );
};

// Slim band of distant meadow + sunflower fields visible above the back
// wall. This is the strongest 2.5D cue — without it the scene reads as
// flat top-down.
const Horizon = ({ phase }: { phase: SkyPhase }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: `${SKY_BAND * 100}%`,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}
  >
    {/* Distant rolling sunflower hills — three layered parallax bands. */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '52%',
        background: phase === 'night' ? '#2a1750' : '#86c95a',
        clipPath:
          'polygon(0% 60%, 6% 50%, 14% 58%, 22% 48%, 32% 56%, 44% 46%, 56% 56%, 68% 48%, 80% 58%, 92% 48%, 100% 56%, 100% 100%, 0% 100%)',
        opacity: 0.85,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '38%',
        background: phase === 'night' ? '#1c0f3a' : '#5fa83a',
        clipPath:
          'polygon(0% 70%, 10% 56%, 22% 66%, 36% 54%, 50% 64%, 64% 56%, 78% 66%, 90% 56%, 100% 62%, 100% 100%, 0% 100%)',
      }}
    />
    {/* Tiny sunflower dots scattered on the far hills */}
    {[
      [12, 70], [28, 78], [44, 72], [60, 80], [76, 74], [88, 80],
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
          opacity: 0.85,
        }}
      />
    ))}
    {/* Sun or moon */}
    <Celestial phase={phase} />
  </div>
);

const Celestial = ({ phase }: { phase: SkyPhase }) => {
  if (phase === 'night') {
    return (
      <div
        style={{
          position: 'absolute',
          right: '12%',
          top: '12%',
          width: 18,
          height: 18,
          background: '#fff5dc',
          borderRadius: '50%',
          boxShadow: '0 0 24px 6px rgba(255,245,220,0.4)',
        }}
      />
    );
  }
  if (phase === 'dawn') {
    return (
      <div
        style={{
          position: 'absolute',
          left: '14%',
          top: '36%',
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
          top: '38%',
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

// Back wall — TOP face (sunlit) above, FRONT face (shaded) below.
// This is the major depth cue. Looks like you're inside a courtyard
// looking out over the meadow.
const BackWall = () => (
  <>
    {/* Top face: sun-lit pink stone, runs across the top, capped */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${SKY_BAND * 100}%`,
        height: `${BACK_TOP_BAND * 100}%`,
        background:
          `repeating-linear-gradient(90deg,
            #ffd5e0 0 28px,
            #f8b9cd 28px 30px,
            #ffd5e0 30px 58px,
            #e89cb6 58px 60px),
           linear-gradient(180deg, #ffe4ee 0%, #f8b9cd 100%)`,
        boxShadow:
          'inset 0 2px 0 #fff2f7, inset 0 -2px 0 #b96680, 0 2px 0 rgba(0,0,0,0.18)',
      }}
    />
    {/* Front face: in shadow, taller, brick texture */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(SKY_BAND + BACK_TOP_BAND) * 100}%`,
        height: `${BACK_FACE * 100}%`,
        background:
          `repeating-linear-gradient(90deg,
            #d99fb2 0 32px,
            #c47898 32px 34px,
            #d99fb2 34px 64px,
            #b96680 64px 66px),
           repeating-linear-gradient(0deg,
            rgba(0,0,0,0) 0 14px,
            rgba(74,39,16,0.12) 14px 16px),
           linear-gradient(180deg, #c47898 0%, #8a4a5a 100%)`,
        boxShadow:
          'inset 0 2px 0 #b96680, inset 0 -2px 0 #6a3045, 0 6px 8px rgba(0,0,0,0.25)',
      }}
    />
    {/* Decorative crenellations on top of the back wall */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(SKY_BAND - 0.018) * 100}%`,
        height: `${0.018 * 100}%`,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 6%',
        pointerEvents: 'none',
      }}
    >
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          style={{
            width: '5%',
            height: '100%',
            background: '#d99fb2',
            boxShadow: 'inset 0 2px 0 #ffd5e0, inset 0 -2px 0 #b96680',
          }}
        />
      ))}
    </div>
  </>
);

// Tile-based floor — discrete 16x16-feel tiles arranged in a checker grid
// with subtle alternating colors and crisp grout lines.
const TileFloor = () => {
  const TILE = 56; // px — chunky tiles read better than tiny ones on phones
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${(SKY_BAND + BACK_TOP_BAND + BACK_FACE) * 100}%`,
        bottom: `${(RAIL_TOP_BAND + RAIL_FACE) * 100}%`,
        background: `
          linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.06) 100%),
          repeating-conic-gradient(
            #ffe7ee 0% 25%,
            #f7d2dc 25% 50%
          )`,
        backgroundSize: `${TILE}px ${TILE}px`,
        // Crisp grout lines on top of the checker
        boxShadow:
          'inset 0 2px 0 rgba(0,0,0,0.18), inset 0 -1px 0 rgba(0,0,0,0.08)',
      }}
    >
      {/* Grout grid — drawn as a separate pseudo via overlay div */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `linear-gradient(90deg, rgba(140,70,90,0.18) 1px, transparent 1px),
             linear-gradient(0deg,  rgba(140,70,90,0.18) 1px, transparent 1px)`,
          backgroundSize: `${TILE}px ${TILE}px`,
          pointerEvents: 'none',
        }}
      />
      {/* A few darker accent tiles scattered for variation */}
      {[
        { x: 14, y: 38 }, { x: 52, y: 30 }, { x: 76, y: 60 },
        { x: 28, y: 70 }, { x: 64, y: 80 },
      ].map((t, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: TILE,
            height: TILE,
            background: 'rgba(180,90,120,0.18)',
            pointerEvents: 'none',
          }}
        />
      ))}
      {/* A central rose-medallion tile motif */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: TILE * 2,
          height: TILE * 2,
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 32 32" width="100%" height="100%" shapeRendering="crispEdges">
          <rect x="14" y="2"  width="4" height="4" fill="#ff6f9c" />
          <rect x="2"  y="14" width="4" height="4" fill="#ff6f9c" />
          <rect x="26" y="14" width="4" height="4" fill="#ff6f9c" />
          <rect x="14" y="26" width="4" height="4" fill="#ff6f9c" />
          <rect x="13" y="13" width="6" height="6" fill="#ff5d8f" />
          <rect x="14" y="14" width="4" height="4" fill="#ffd84d" />
        </svg>
      </div>
    </div>
  );
};

// Front balustrade — top face + front face, both with stone texture.
const FrontRail = () => null; // painted as overlay so princess can stand near it

const FrontRailOverlay = () => (
  <>
    {/* Top of the railing — pale, sunlit */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: `${RAIL_FACE * 100}%`,
        height: `${RAIL_TOP_BAND * 100}%`,
        background:
          `repeating-linear-gradient(90deg,
            #ffd5e0 0 24px,
            #f8b9cd 24px 26px,
            #ffd5e0 26px 50px),
           linear-gradient(180deg, #ffeaf2 0%, #f8b9cd 100%)`,
        boxShadow:
          'inset 0 2px 0 #fff2f7, inset 0 -2px 0 #b96680, 0 -4px 8px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        zIndex: 8,
      }}
    />
    {/* Front face of the railing — shaded with vertical balusters */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: `${RAIL_FACE * 100}%`,
        background:
          `repeating-linear-gradient(90deg,
            #d99fb2 0 18px,
            #b96680 18px 22px,
            #d99fb2 22px 40px),
           linear-gradient(180deg, #c47898 0%, #8a4a5a 100%)`,
        boxShadow: 'inset 0 2px 0 #b96680, inset 0 -2px 0 #6a3045',
        pointerEvents: 'none',
        zIndex: 8,
      }}
    />
  </>
);

// Side walls — narrow, run from back wall down to the front rail.
const SideWalls = () => (
  <>
    {/* Left wall */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: `${(SKY_BAND + BACK_TOP_BAND) * 100}%`,
        bottom: `${(RAIL_TOP_BAND + RAIL_FACE) * 100}%`,
        width: '4%',
        background:
          `repeating-linear-gradient(0deg,
            #d99fb2 0 26px,
            #c47898 26px 28px,
            #d99fb2 28px 52px,
            #b96680 52px 54px),
           linear-gradient(90deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset 2px 0 0 #ffeaf2, inset -2px 0 0 #6a3045',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
    {/* Right wall */}
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: `${(SKY_BAND + BACK_TOP_BAND) * 100}%`,
        bottom: `${(RAIL_TOP_BAND + RAIL_FACE) * 100}%`,
        width: '4%',
        background:
          `repeating-linear-gradient(0deg,
            #d99fb2 0 26px,
            #c47898 26px 28px,
            #d99fb2 28px 52px,
            #b96680 52px 54px),
           linear-gradient(270deg, #ffd5e0 0%, #c47898 100%)`,
        boxShadow:
          'inset -2px 0 0 #ffeaf2, inset 2px 0 0 #6a3045',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  </>
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
