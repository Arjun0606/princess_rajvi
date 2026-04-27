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
  { id: 'sunflower', x: 0.20, y: 0.42, width: 64, height: 64, label: 'sunflowers', action: 'water' },
  // Top-right: GIANT diet coke can sitting on a wooden crate
  { id: 'coke',      x: 0.80, y: 0.42, width: 48, height: 72, label: 'diet coke',  action: 'coke' },
  // Bottom-left: GIANT Jägermeister bottle on a barrel
  { id: 'jager',     x: 0.22, y: 0.82, width: 44, height: 76, label: 'jäger',      action: 'jager' },
  // Bottom-right: GIANT joint resting on a velvet cushion with smoke wisp
  { id: 'joint',     x: 0.78, y: 0.82, width: 60, height: 60, label: 'joint',      action: 'weed' },
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
          {/* Label tag — small stardew-paper pill below the station */}
          <div
            className="stardew-box"
            style={{
              position: 'absolute',
              bottom: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '2px 6px 3px',
              borderRadius: 3,
              fontFamily: 'var(--pixel-font)',
              fontSize: 13,
              color: 'var(--stardew-text)',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: onCooldown ? 0.5 : 1,
              boxShadow: '2px 2px 0 0 rgba(74,39,16,0.35)',
              border: '2px solid #8a5230',
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

// Giant Diet Coke can standing on a small wooden crate. The CAN is the
// hero — it's instantly recognizable: silver body, red middle stripe,
// "Diet Coke" wordmark, classic ribbed top.
const Fridge = () => (
  <svg viewBox="0 0 24 36" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Wooden crate base */}
    <rect x="2"  y="30" width="20" height="6" fill="#a96820" />
    <rect x="2"  y="30" width="20" height="1" fill="#c98640" />
    <rect x="2"  y="35" width="20" height="1" fill="#5b3826" />
    <rect x="6"  y="30" width="1"  height="6" fill="#5b3826" />
    <rect x="11" y="30" width="1"  height="6" fill="#5b3826" />
    <rect x="16" y="30" width="1"  height="6" fill="#5b3826" />
    {/* Can top — dark rim with silver pull-tab */}
    <rect x="6"  y="2"  width="12" height="1" fill="#3a1a30" />
    <rect x="6"  y="3"  width="12" height="1" fill="#888" />
    <rect x="7"  y="2"  width="10" height="1" fill="#a8a8a8" />
    <rect x="11" y="3"  width="2"  height="1" fill="#666" />
    {/* Can body — silver upper */}
    <rect x="5"  y="4"  width="14" height="9" fill="#dde4ec" />
    <rect x="5"  y="4"  width="1"  height="9" fill="#fff" />
    <rect x="18" y="4"  width="1"  height="9" fill="#a8a8a8" />
    <rect x="6"  y="5"  width="12" height="1" fill="#fff" />
    {/* Red middle stripe with Diet Coke wordmark */}
    <rect x="5"  y="13" width="14" height="6" fill="#d2202a" />
    <rect x="5"  y="13" width="14" height="1" fill="#ee4040" />
    <rect x="5"  y="18" width="14" height="1" fill="#9a1818" />
    {/* Pixel-letter "DIET" */}
    <rect x="6"  y="15" width="1" height="2" fill="#fff" />
    <rect x="8"  y="15" width="1" height="2" fill="#fff" />
    <rect x="9"  y="15" width="1" height="1" fill="#fff" />
    <rect x="10" y="15" width="1" height="2" fill="#fff" />
    <rect x="9"  y="17" width="1" height="0" fill="#fff" />
    <rect x="12" y="15" width="3" height="1" fill="#fff" />
    <rect x="13" y="16" width="1" height="2" fill="#fff" />
    {/* Can body — silver lower */}
    <rect x="5"  y="19" width="14" height="9" fill="#dde4ec" />
    <rect x="5"  y="19" width="1"  height="9" fill="#fff" />
    <rect x="18" y="19" width="1"  height="9" fill="#a8a8a8" />
    <rect x="6"  y="20" width="12" height="1" fill="#fff" />
    {/* Bottom rim */}
    <rect x="5"  y="28" width="14" height="1" fill="#888" />
    <rect x="5"  y="29" width="14" height="1" fill="#3a1a30" />
    {/* Specular highlight pixels */}
    <rect x="7"  y="6"  width="1" height="3" fill="#fff" />
    <rect x="7"  y="22" width="1" height="3" fill="#fff" />
    <rect x="6"  y="14" width="1" height="2" fill="#ee4040" />
    <rect x="17" y="6"  width="1" height="2" fill="#888" />
  </svg>
);

// Giant Jägermeister bottle standing on a small wooden barrel. The
// BOTTLE is the hero: dark green glass, foil-wrapped neck, classic
// orange label with the antlered stag silhouette + "Jägermeister"
// wordmark. Big enough to be unmistakable.
const CocktailTable = () => (
  <svg viewBox="0 0 22 38" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Wooden barrel base */}
    <ellipse cx="11" cy="36" rx="9" ry="2" fill="#5b3826" />
    <ellipse cx="11" cy="34" rx="9" ry="2" fill="#a96820" />
    <rect x="2"  y="30" width="18" height="5" fill="#a96820" />
    <rect x="2"  y="30" width="18" height="1" fill="#c98640" />
    <rect x="2"  y="34" width="18" height="1" fill="#5b3826" />
    {/* Iron bands on barrel */}
    <rect x="2"  y="31" width="18" height="1" fill="#3a2010" />
    <rect x="2"  y="33" width="18" height="1" fill="#3a2010" />
    {/* Bottle: silver foil cap */}
    <rect x="9"  y="2"  width="4"  height="2" fill="#a8a8a8" />
    <rect x="9"  y="2"  width="4"  height="1" fill="#dde4ec" />
    {/* Bottle neck (slim, dark green) */}
    <rect x="9"  y="4"  width="4"  height="6" fill="#0e2f12" />
    <rect x="9"  y="4"  width="1"  height="6" fill="#1f4d23" />
    {/* Bottle shoulder */}
    <rect x="7"  y="10" width="8"  height="2" fill="#0e2f12" />
    <rect x="7"  y="10" width="1"  height="2" fill="#1f4d23" />
    {/* Bottle body (tall, dark green) */}
    <rect x="6"  y="12" width="10" height="18" fill="#0e2f12" />
    <rect x="6"  y="12" width="1"  height="18" fill="#1f4d23" />
    <rect x="15" y="12" width="1"  height="18" fill="#06180a" />
    {/* Orange label */}
    <rect x="6"  y="16" width="10" height="11" fill="#ff8c1a" />
    <rect x="6"  y="16" width="10" height="1"  fill="#ffaa44" />
    <rect x="6"  y="26" width="10" height="1"  fill="#cc6600" />
    {/* Stag silhouette on label */}
    <rect x="10" y="18" width="2"  height="2" fill="#3a1a30" />
    <rect x="10" y="20" width="2"  height="3" fill="#3a1a30" />
    <rect x="9"  y="19" width="1"  height="1" fill="#3a1a30" />
    <rect x="12" y="19" width="1"  height="1" fill="#3a1a30" />
    {/* Antlers (zigzag pattern above stag head) */}
    <rect x="9"  y="17" width="1" height="1" fill="#3a1a30" />
    <rect x="12" y="17" width="1" height="1" fill="#3a1a30" />
    <rect x="8"  y="16" width="1" height="1" fill="#3a1a30" />
    <rect x="13" y="16" width="1" height="1" fill="#3a1a30" />
    {/* Wordmark line */}
    <rect x="7"  y="24" width="8"  height="1" fill="#3a1a30" />
    {/* Specular highlight on bottle (down the left side) */}
    <rect x="7"  y="13" width="1" height="3"  fill="#3a8a3a" opacity="0.7" />
    <rect x="7"  y="28" width="1" height="2"  fill="#3a8a3a" opacity="0.7" />
  </svg>
);

// Giant joint resting at an angle on a velvet cushion. The JOINT is
// the hero: long white rolled paper, twisted at one end, glowing orange
// ember at the lit tip, and a tall rising smoke trail. The cushion is
// just there to ground it.
const Cushion = () => (
  <svg viewBox="0 0 40 32" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Cushion shadow on grass */}
    <ellipse cx="20" cy="29" rx="14" ry="2" fill="rgba(0,0,0,0.3)" />
    {/* Velvet cushion (low + wide, viewed 3/4) */}
    <ellipse cx="20" cy="26" rx="14" ry="3.5" fill="#a64a72" />
    <ellipse cx="20" cy="24" rx="14" ry="3.5" fill="#ffc4d8" />
    <ellipse cx="20" cy="23.5" rx="11" ry="2.5" fill="#ffeaf2" />
    {/* Tassels */}
    <rect x="5"  y="26" width="1" height="3" fill="#ffd84d" />
    <rect x="34" y="26" width="1" height="3" fill="#ffd84d" />
    {/* Joint — laid diagonally, big and obvious */}
    {/* Outline */}
    <rect x="6"  y="14" width="22" height="4" fill="#3a1a30" />
    {/* White rolled paper body */}
    <rect x="7"  y="15" width="20" height="2" fill="#fff5dd" />
    <rect x="7"  y="15" width="20" height="1" fill="#fff" />
    {/* Twisted unlit end (left side) */}
    <rect x="6"  y="15" width="1"  height="2" fill="#e8d8a8" />
    <rect x="5"  y="16" width="1"  height="1" fill="#3a1a30" />
    {/* Lit tip with ember (right side) */}
    <rect x="27" y="14" width="1"  height="4" fill="#3a1a30" />
    <rect x="28" y="15" width="2"  height="2" fill="#ff7a18" />
    <rect x="29" y="15" width="1"  height="1" fill="#ffd84d" />
    <rect x="30" y="16" width="1"  height="1" fill="#ff4400" />
    {/* Glow halo around ember */}
    <rect x="27" y="13" width="4"  height="1" fill="#ff8c1a" opacity="0.4" />
    <rect x="27" y="18" width="4"  height="1" fill="#ff8c1a" opacity="0.4" />
    {/* Visible roach paper detail */}
    <rect x="8"  y="16" width="1"  height="1" fill="#e8d8a8" />
    <rect x="13" y="16" width="1"  height="1" fill="#e8d8a8" />
    <rect x="18" y="16" width="1"  height="1" fill="#e8d8a8" />
    <rect x="23" y="16" width="1"  height="1" fill="#e8d8a8" />
    {/* Rising smoke trail (tall) */}
    <rect x="30" y="11" width="1"  height="1" fill="#dadaee" opacity="0.7" />
    <rect x="29" y="9"  width="2"  height="1" fill="#dadaee" opacity="0.6" />
    <rect x="30" y="7"  width="1"  height="1" fill="#dadaee" opacity="0.5" />
    <rect x="29" y="5"  width="2"  height="1" fill="#dadaee" opacity="0.4" />
    <rect x="30" y="3"  width="1"  height="1" fill="#dadaee" opacity="0.3" />
    <rect x="31" y="1"  width="1"  height="1" fill="#dadaee" opacity="0.2" />
  </svg>
);
