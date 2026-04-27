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
  { id: 'sunflower', x: 0.18, y: 0.22, width: 60, height: 70, label: 'sunflower garden', action: 'water' },
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
};

export const Stations = ({ cooldowns, onStationTap }: Props) => (
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
          <StationSprite kind={s.id} />
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

const StationSprite = ({ kind }: { kind: StationKind }) => {
  switch (kind) {
    case 'sunflower': return <SunflowerPlot />;
    case 'coke':      return <Fridge />;
    case 'jager':     return <CocktailTable />;
    case 'joint':     return <Cushion />;
  }
};

const SunflowerPlot = () => (
  <svg viewBox="0 0 30 35" width="100%" height="100%" shapeRendering="crispEdges">
    {/* Soil */}
    <rect x="0" y="20" width="30" height="14" fill="#5b3826" />
    <rect x="0" y="20" width="30" height="2" fill="#3a2010" />
    <rect x="0" y="32" width="30" height="2" fill="#2a1408" />
    {/* Sunflower 1 */}
    <rect x="6" y="6" width="6" height="6" fill="#ffd84d" />
    <rect x="4" y="8" width="10" height="2" fill="#ffd84d" />
    <rect x="8" y="8" width="2" height="2" fill="#3a2010" />
    <rect x="8" y="12" width="2" height="9" fill="#3a8a3a" />
    {/* Sunflower 2 */}
    <rect x="18" y="3" width="6" height="6" fill="#ffd84d" />
    <rect x="16" y="5" width="10" height="2" fill="#ffd84d" />
    <rect x="20" y="5" width="2" height="2" fill="#3a2010" />
    <rect x="20" y="9" width="2" height="12" fill="#3a8a3a" />
    {/* Sunflower 3 small */}
    <rect x="12" y="11" width="4" height="4" fill="#e58a00" />
    <rect x="13" y="12" width="2" height="2" fill="#3a2010" />
    <rect x="13" y="15" width="2" height="6" fill="#3a8a3a" />
  </svg>
);

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
