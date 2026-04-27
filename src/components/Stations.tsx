import { ActionKind } from '../game/state';

export type StationKind = 'coke' | 'jager' | 'joint' | 'sunflower';

export type Station = {
  id: StationKind;
  // Map position in 0..1 coordinates.
  x: number;
  y: number;
  // Where principal sprite anchors (px size).
  width: number;
  height: number;
  label: string;
  action: ActionKind;
};

// y values are the placement of each station's BOTTOM edge in 0..1 map
// coordinates. Stations are anchored bottom-center, so (x, y) is where
// the station "stands" on the grass — the path branch ends right at that
// point. Princess walks up the path and arrives at the station base.
export const STATIONS: Station[] = [
  // Top-left: sunflower garden bed
  { id: 'sunflower', x: 0.20, y: 0.42, width: 56, height: 60, label: 'garden',  action: 'water' },
  // Top-right: mini-fridge with diet coke
  { id: 'coke',      x: 0.80, y: 0.42, width: 36, height: 56, label: 'fridge',  action: 'coke' },
  // Bottom-left: cocktail table with jäger
  { id: 'jager',     x: 0.22, y: 0.82, width: 50, height: 48, label: 'bar',     action: 'jager' },
  // Bottom-right: floor cushion with joint
  { id: 'joint',     x: 0.78, y: 0.82, width: 50, height: 46, label: 'cushion', action: 'weed' },
];

type Props = {
  cooldowns: Partial<Record<StationKind, number>>;
  onStationTap: (s: Station) => void;
  flowersAllTime: number;
};

export const Stations = ({ cooldowns, onStationTap, flowersAllTime }: Props) => (
  <>
    {STATIONS.map((s) => {
      const cooldownLeft = cooldowns[s.id] ? Math.max(0, cooldowns[s.id]! - Date.now()) : 0;
      const onCooldown = cooldownLeft > 0;
      return (
        <div
          key={s.id}
          onClick={() => onStationTap(s)}
          style={{
            position: 'absolute',
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            transform: 'translate(-50%, -100%)',
            width: s.width,
            height: s.height,
            cursor: 'pointer',
            zIndex: 3,
            filter: onCooldown ? 'grayscale(0.6) brightness(0.8)' : undefined,
            opacity: onCooldown ? 0.65 : 1,
            transition: 'opacity 0.3s ease, filter 0.3s ease',
            animation: !onCooldown ? 'station-pulse 2.4s ease-in-out infinite' : undefined,
          }}
        >
          {/* Soft elliptical ground shadow — anchors the station to the floor */}
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              height: 10,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.32)',
              filter: 'blur(2px)',
              pointerEvents: 'none',
            }}
          />
          <StationSprite kind={s.id} flowersAllTime={flowersAllTime} />
          {/* Label tag below */}
          <div
            style={{
              position: 'absolute',
              bottom: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--pixel-font)',
              fontSize: 13,
              color: '#fff5dc',
              textShadow: '1px 1px 0 #4a2710',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: onCooldown ? 0.6 : 0.9,
            }}
          >
            {s.label}
          </div>
        </div>
      );
    })}
  </>
);

const StationSprite = ({
  kind,
  flowersAllTime,
}: {
  kind: StationKind;
  flowersAllTime: number;
}) => {
  switch (kind) {
    case 'sunflower': return <SunflowerPlot flowersAllTime={flowersAllTime} />;
    case 'coke':      return <Fridge />;
    case 'jager':     return <CocktailTable />;
    case 'joint':     return <Cushion />;
  }
};

// Garden plot that visibly fills up the more flowers the player has grown.
// Slot positions are stable so each new bloom appears in the next empty
// patch of soil — feels like progression, not a random redraw.
const FLOWER_SLOTS: { x: number; y: number; size: 'L' | 'M' | 'S'; bud?: boolean }[] = [
  { x: 4,  y: 4,  size: 'L' },
  { x: 24, y: 8,  size: 'L' },
  { x: 14, y: 14, size: 'M' },
  { x: 36, y: 4,  size: 'M' },
  { x: 44, y: 12, size: 'L' },
  { x: 6,  y: 22, size: 'M' },
  { x: 28, y: 22, size: 'S' },
  { x: 40, y: 24, size: 'M' },
  { x: 18, y: 28, size: 'S', bud: true },
  { x: 50, y: 28, size: 'S', bud: true },
];

const SunflowerPlot = ({ flowersAllTime }: { flowersAllTime: number }) => {
  const visible = Math.max(2, Math.min(FLOWER_SLOTS.length, flowersAllTime));
  const flowers = FLOWER_SLOTS.slice(0, visible);
  return (
    <svg viewBox="0 0 60 52" width="100%" height="100%" shapeRendering="crispEdges">
      {/* Wooden bed — top face (3/4 perspective) */}
      <polygon points="2,32 58,32 60,36 0,36" fill="#a96820" />
      <polygon points="3,33 57,33 58,35 2,35" fill="#c98640" />
      {/* Soil top (lit) — slight parallelogram */}
      <polygon points="3,35 57,35 58,38 2,38" fill="#5b3826" />
      <polygon points="4,36 56,36 57,37 3,37" fill="#3a2010" />
      {/* Bed front face (shaded — gives it real height) */}
      <rect x="0" y="38" width="60" height="10" fill="#5b3826" />
      <rect x="0" y="38" width="60" height="1" fill="#a96820" />
      <rect x="0" y="47" width="60" height="2" fill="#2a1408" />
      {/* Wooden plank divisions on front face */}
      <rect x="14" y="38" width="1" height="9" fill="#3a2010" />
      <rect x="30" y="38" width="1" height="9" fill="#3a2010" />
      <rect x="46" y="38" width="1" height="9" fill="#3a2010" />
      {/* Soil flecks on the visible top */}
      <rect x="10" y="36" width="1" height="1" fill="#2a1408" />
      <rect x="22" y="36" width="1" height="1" fill="#2a1408" />
      <rect x="38" y="36" width="1" height="1" fill="#2a1408" />
      <rect x="50" y="36" width="1" height="1" fill="#2a1408" />
      {flowers.map((f, i) => (
        <Sunflower key={i} x={f.x} y={f.y} size={f.size} bud={f.bud} />
      ))}
    </svg>
  );
};

const Sunflower = ({
  x,
  y,
  size,
  bud,
}: {
  x: number;
  y: number;
  size: 'L' | 'M' | 'S';
  bud?: boolean;
}) => {
  if (bud) {
    // Tiny green sprout, not yet bloomed.
    return (
      <g>
        <rect x={x + 2} y={y + 4} width="2" height="4" fill="#3a8a3a" />
        <rect x={x}     y={y + 4} width="2" height="2" fill="#5fc55f" />
        <rect x={x + 4} y={y + 4} width="2" height="2" fill="#5fc55f" />
      </g>
    );
  }
  if (size === 'S') {
    return (
      <g>
        <rect x={x + 1} y={y}     width="4" height="4" fill="#e58a00" />
        <rect x={x + 2} y={y + 1} width="2" height="2" fill="#3a2010" />
        <rect x={x + 2} y={y + 4} width="2" height="6" fill="#3a8a3a" />
      </g>
    );
  }
  if (size === 'M') {
    return (
      <g>
        <rect x={x + 2} y={y}     width="6" height="6" fill="#ffd84d" />
        <rect x={x}     y={y + 2} width="10" height="2" fill="#ffd84d" />
        <rect x={x + 4} y={y + 2} width="2" height="2" fill="#3a2010" />
        <rect x={x + 4} y={y + 6} width="2" height="8" fill="#3a8a3a" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x + 1} y={y}     width="8" height="2" fill="#ffd84d" />
      <rect x={x}     y={y + 1} width="10" height="6" fill="#ffd84d" />
      <rect x={x + 1} y={y + 7} width="8" height="2" fill="#ffd84d" />
      <rect x={x + 4} y={y + 3} width="2" height="2" fill="#3a2010" />
      <rect x={x + 4} y={y + 9} width="2" height="9" fill="#3a8a3a" />
      <rect x={x + 2} y={y + 12} width="2" height="2" fill="#5fc55f" />
    </g>
  );
};

// Pink mini-fridge from a 3/4 oblique angle: lit top surface, lit left
// face, shaded right face. Coke can sitting on top.
const Fridge = () => (
  <svg viewBox="0 0 28 40" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Top surface (lit) — slight parallelogram suggests 3/4 angle */}
    <polygon points="4,8 22,8 24,10 6,10" fill="#ffe4ee" />
    <polygon points="22,8 24,10 24,12 22,12 22,10 22,10" fill="#f8b9cd" />
    {/* Left face (lit) */}
    <rect x="4" y="10" width="18" height="26" fill="#ffb1cc" />
    {/* Right face (shaded) */}
    <rect x="22" y="10" width="2" height="26" fill="#c47898" />
    {/* Door split */}
    <rect x="4" y="22" width="18" height="1" fill="#8a4a5a" />
    {/* Top door */}
    <rect x="6" y="12" width="14" height="9" fill="#ffd5e0" />
    <rect x="6" y="12" width="14" height="1" fill="#fff2f7" />
    <rect x="6" y="20" width="14" height="1" fill="#c47898" />
    {/* Bottom door */}
    <rect x="6" y="24" width="14" height="11" fill="#ffd5e0" />
    <rect x="6" y="24" width="14" height="1" fill="#fff2f7" />
    {/* Handles */}
    <rect x="18" y="14" width="2" height="5" fill="#3a1a30" />
    <rect x="18" y="26" width="2" height="5" fill="#3a1a30" />
    {/* Bottom shadow band */}
    <rect x="4" y="35" width="20" height="1" fill="#6a3045" />
    {/* Coke can on top, viewed from front */}
    <rect x="11" y="3" width="6" height="6" fill="#dde4ec" />
    <rect x="11" y="3" width="6" height="1" fill="#fff" />
    <rect x="11" y="5" width="6" height="2" fill="#d2202a" />
    <rect x="12" y="6" width="4" height="1" fill="#fff" />
    {/* Coke can lid */}
    <rect x="11" y="2" width="6" height="1" fill="#3a1a30" />
    <rect x="13" y="2" width="2" height="1" fill="#a8a8a8" />
  </svg>
);

// Round cocktail table viewed from 3/4: elliptical top in perspective,
// thick rim catching shadow underneath, single pedestal leg + base.
// Bottle and rocks glass standing on top, drawn from the front.
const CocktailTable = () => (
  <svg viewBox="0 0 40 38" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Table top (perspective ellipse) */}
    <ellipse cx="20" cy="22" rx="16" ry="5" fill="#8a4a5a" />
    <ellipse cx="20" cy="20" rx="16" ry="5" fill="#ffd5e0" />
    <ellipse cx="20" cy="19" rx="13" ry="3.5" fill="#fff2f7" />
    {/* Pedestal leg */}
    <rect x="17" y="23" width="6" height="9" fill="#8a4a5a" />
    <rect x="17" y="23" width="2" height="9" fill="#c47898" />
    <rect x="22" y="23" width="1" height="9" fill="#5a2f3a" />
    {/* Base disc */}
    <ellipse cx="20" cy="33" rx="9" ry="2.4" fill="#5a2f3a" />
    <ellipse cx="20" cy="32.4" rx="9" ry="2.4" fill="#8a4a5a" />
    {/* Jäger bottle (front view) sitting on the table */}
    <rect x="14" y="9"  width="4" height="2"  fill="#dde4ec" />
    <rect x="14" y="11" width="4" height="2"  fill="#1f4d23" />
    <rect x="14" y="13" width="4" height="6"  fill="#0e2f12" />
    <rect x="13" y="14" width="6" height="4"  fill="#ff8c1a" />
    <rect x="14" y="15" width="4" height="1"  fill="#fff" />
    {/* Highlight on bottle */}
    <rect x="14" y="13" width="1" height="6" fill="#3a8a3a" />
    {/* Rocks glass */}
    <rect x="22" y="13" width="5" height="6" fill="#dde4ec" opacity="0.85" />
    <rect x="22" y="13" width="5" height="1" fill="#fff" />
    <rect x="22" y="14" width="5" height="2" fill="#a8704a" opacity="0.9" />
    <rect x="22" y="18" width="5" height="1" fill="#7a4a30" />
  </svg>
);

// Plush floor cushion on a small rug, viewed at 3/4. The cushion has a
// visible top face + front face for height; the rug extends out in
// perspective. Joint resting on the cushion top.
const Cushion = () => (
  <svg viewBox="0 0 40 32" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Rug — perspective trapezoid (narrower at top, wider at bottom) */}
    <polygon points="6,16 34,16 38,28 2,28" fill="#5a2f3a" />
    <polygon points="7,17 33,17 36,27 4,27" fill="#ffd5e0" />
    <polygon points="9,18 31,18 33,26 7,26" fill="#fff2f7" />
    {/* Pattern dots on rug (in perspective) */}
    <rect x="11" y="20" width="2" height="2" fill="#ff5d8f" />
    <rect x="19" y="20" width="2" height="2" fill="#ff5d8f" />
    <rect x="27" y="20" width="2" height="2" fill="#ff5d8f" />
    <rect x="13" y="23" width="2" height="2" fill="#ff5d8f" />
    <rect x="25" y="23" width="2" height="2" fill="#ff5d8f" />
    {/* Cushion top face (lit) */}
    <ellipse cx="20" cy="11" rx="10" ry="3" fill="#ff8ab3" />
    <ellipse cx="20" cy="10" rx="10" ry="3" fill="#ffc4d8" />
    {/* Cushion front face (shaded) — gives it height */}
    <rect x="10" y="11" width="20" height="5" fill="#ff8ab3" />
    <rect x="10" y="11" width="20" height="1" fill="#ffc4d8" />
    <rect x="10" y="15" width="20" height="1" fill="#a64a72" />
    <ellipse cx="20" cy="16" rx="10" ry="2.5" fill="#a64a72" />
    {/* Tassels at the corners */}
    <rect x="9"  y="14" width="1" height="3" fill="#ffd84d" />
    <rect x="30" y="14" width="1" height="3" fill="#ffd84d" />
    {/* Joint resting on cushion top */}
    <rect x="14" y="8" width="10" height="1" fill="#3a1a30" />
    <rect x="14" y="9" width="10" height="1" fill="#fff5dd" />
    <rect x="24" y="9" width="1" height="1" fill="#ff7a18" />
    {/* Smoke wisp */}
    <rect x="25" y="6" width="1" height="1" fill="#dadaee" opacity="0.75" />
    <rect x="26" y="4" width="1" height="1" fill="#dadaee" opacity="0.5" />
  </svg>
);
