import { CompanionMeta } from '../game/companions';

type Props = {
  companions: CompanionMeta[];
};

// Tiny critters that hang around the terrace. Positioned at the foreground
// edge so they read as "in the scene" with princess. The art is generated
// from /art/companion-*.png if available; emoji fallback otherwise.
export const Companions = ({ companions }: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 110,
        height: 80,
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      {companions.map((c, i) => (
        <Critter key={c.id} c={c} index={i} />
      ))}
    </div>
  );
};

const POSITIONS: { left: string; bottom: number; flip: boolean }[] = [
  { left: '12%', bottom: 14, flip: false },
  { left: '78%', bottom: 6,  flip: true  },
  { left: '34%', bottom: 4,  flip: false },
];

const Critter = ({ c, index }: { c: CompanionMeta; index: number }) => {
  const pos = POSITIONS[index % POSITIONS.length]!;
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.left,
        bottom: pos.bottom,
        transform: pos.flip ? 'scaleX(-1)' : undefined,
        animation: 'float 2.6s ease-in-out infinite',
        animationDelay: `${index * 0.3}s`,
      }}
    >
      <CritterArt c={c} />
    </div>
  );
};

const CritterArt = ({ c }: { c: CompanionMeta }) => {
  const file = `/art/companion-${c.id}.png`;
  return (
    <span
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={file}
        alt={c.name}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
        }}
      />
      {/* fallback emoji rendered behind so it shows if the img fails */}
      <span
        style={{
          position: 'absolute',
          fontSize: 36,
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))',
          zIndex: -1,
        }}
      >
        {c.emoji}
      </span>
    </span>
  );
};
