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
  // All 4 stations are now real pixel-art PNG sprites generated via
  // OpenAI gpt-image. Each is a clean game-icon style sprite shown
  // at 64x64 in the world.
  { id: 'sunflower', x: 0.20, y: 0.42, width: 72, height: 72, label: 'sunflowers', action: 'water' },
  { id: 'coke',      x: 0.80, y: 0.42, width: 64, height: 72, label: 'diet coke',  action: 'coke' },
  { id: 'jager',     x: 0.22, y: 0.82, width: 64, height: 72, label: 'jäger',      action: 'jager' },
  { id: 'joint',     x: 0.78, y: 0.82, width: 72, height: 64, label: 'joint',      action: 'weed' },
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
  // Real pixel-art PNG sprites generated via OpenAI. We use object-fit
  // contain so the sprite scales cleanly to the station's box. Each PNG
  // already has a soft circular vignette / shaped background so they
  // blend into the world even though the source canvas is square.
  const src = `/art/item-${kind}.png?v=3`;
  return (
    <>
      <img
        src={src}
        alt={kind}
        className="pixel-art"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          // No transform-based animation — iOS Safari smooths transformed
          // pixel-art images. Crispness wins over a 3s bob.
        }}
      />
      {kind === 'sunflower' && flowersAllTime > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: 'rgba(74,39,16,0.85)',
            color: '#ffd84d',
            fontFamily: 'var(--pixel-font)',
            fontSize: 11,
            padding: '1px 5px 2px',
            borderRadius: 3,
            border: '1px solid #ffd84d',
            lineHeight: 1,
          }}
        >
          {flowersAllTime}
        </div>
      )}
    </>
  );
};

