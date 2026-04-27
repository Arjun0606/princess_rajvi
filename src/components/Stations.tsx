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

export const STATIONS: Station[] = [
  // Top-left: sunflower garden plot (water/water → flower)
  { id: 'sunflower', x: 0.18, y: 0.22, width: 80, height: 90, label: 'sunflower garden', action: 'water' },
  // Top-right: fridge for diet coke
  { id: 'coke',      x: 0.78, y: 0.22, width: 50, height: 70, label: 'mini fridge',     action: 'coke' },
  // Bottom-left: bar / table with jäger bottle
  { id: 'jager',     x: 0.18, y: 0.74, width: 70, height: 60, label: 'cocktail table',  action: 'jager' },
  // Bottom-right: cushion with joint
  { id: 'joint',     x: 0.78, y: 0.74, width: 70, height: 60, label: 'cushion',         action: 'weed' },
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
          <StationSprite kind={s.id} flowersAllTime={flowersAllTime} />
          {/* Label tag below */}
          <div
            style={{
              position: 'absolute',
              bottom: -16,
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
    <svg viewBox="0 0 60 50" width="100%" height="100%" shapeRendering="crispEdges">
      {/* Soil bed — wider so it can hold more flowers */}
      <rect x="0" y="34" width="60" height="14" fill="#5b3826" />
      <rect x="0" y="34" width="60" height="2" fill="#3a2010" />
      <rect x="0" y="46" width="60" height="2" fill="#2a1408" />
      {/* Soil flecks */}
      <rect x="6"  y="40" width="2" height="2" fill="#3a2010" />
      <rect x="22" y="42" width="2" height="2" fill="#3a2010" />
      <rect x="42" y="40" width="2" height="2" fill="#3a2010" />
      <rect x="52" y="42" width="2" height="2" fill="#3a2010" />
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

const Fridge = () => (
  <svg viewBox="0 0 25 35" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Pink fridge body */}
    <rect x="2" y="2" width="21" height="32" fill="#ffb1cc" />
    <rect x="2" y="2" width="21" height="2" fill="#ffd5e0" />
    <rect x="2" y="32" width="21" height="2" fill="#8a4a5a" />
    <rect x="2" y="2" width="2" height="32" fill="#ffd5e0" />
    <rect x="21" y="2" width="2" height="32" fill="#8a4a5a" />
    {/* Top section */}
    <rect x="4" y="4" width="17" height="10" fill="#ffd5e0" />
    <rect x="4" y="14" width="17" height="2" fill="#3a1a30" />
    {/* Bottom section */}
    <rect x="4" y="16" width="17" height="16" fill="#ffd5e0" />
    {/* Handle */}
    <rect x="18" y="18" width="2" height="6" fill="#3a1a30" />
    <rect x="18" y="6" width="2" height="6" fill="#3a1a30" />
    {/* Coke can on top */}
    <rect x="9" y="0" width="7" height="2" fill="#dde4ec" />
    <rect x="9" y="-1" width="7" height="1" fill="#3a1a30" />
    <rect x="10" y="0" width="5" height="1" fill="#d2202a" />
  </svg>
);

const CocktailTable = () => (
  <svg viewBox="0 0 35 30" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Table circle (top-down: ellipse-ish) */}
    <ellipse cx="17" cy="22" rx="14" ry="4" fill="#8a4a5a" />
    <ellipse cx="17" cy="20" rx="14" ry="4" fill="#ffd5e0" />
    <ellipse cx="17" cy="20" rx="11" ry="2.5" fill="#ffeaf2" />
    {/* Table leg */}
    <rect x="15" y="22" width="4" height="6" fill="#8a4a5a" />
    <rect x="13" y="27" width="8" height="2" fill="#5b3826" />
    {/* Bottle on top */}
    <rect x="12" y="11" width="4" height="2" fill="#dde4ec" />
    <rect x="12" y="13" width="4" height="6" fill="#1f4d23" />
    <rect x="11" y="15" width="6" height="3" fill="#ff8c1a" />
    {/* Glass */}
    <rect x="20" y="14" width="4" height="5" fill="#dde4ec" opacity="0.7" />
    <rect x="20" y="14" width="4" height="2" fill="#1f4d23" />
  </svg>
);

const Cushion = () => (
  <svg viewBox="0 0 35 30" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Rug */}
    <rect x="2" y="14" width="31" height="14" fill="#8a4a5a" />
    <rect x="3" y="15" width="29" height="12" fill="#ffd5e0" />
    <rect x="4" y="16" width="27" height="10" fill="#ffeaf2" />
    {/* Pattern */}
    <rect x="6" y="18" width="2" height="2" fill="#ff5d8f" />
    <rect x="14" y="18" width="2" height="2" fill="#ff5d8f" />
    <rect x="22" y="18" width="2" height="2" fill="#ff5d8f" />
    <rect x="6" y="22" width="2" height="2" fill="#ff5d8f" />
    <rect x="14" y="22" width="2" height="2" fill="#ff5d8f" />
    <rect x="22" y="22" width="2" height="2" fill="#ff5d8f" />
    {/* Cushion (square) */}
    <rect x="11" y="6" width="14" height="10" fill="#8a4a5a" />
    <rect x="12" y="7" width="12" height="8" fill="#ff8ab3" />
    <rect x="13" y="8" width="10" height="6" fill="#ffc4d8" />
    {/* Joint laying on cushion */}
    <rect x="14" y="10" width="8" height="1" fill="#3a1a30" />
    <rect x="14" y="11" width="8" height="1" fill="#fff5dd" />
    <rect x="22" y="11" width="1" height="1" fill="#ff7a18" />
    <rect x="14" y="12" width="8" height="1" fill="#3a1a30" />
  </svg>
);
