import { useMemo } from 'react';
import { skyGradient, sunPosition, moonPosition, moonPhase } from '../game/time';

type Props = {
  date: Date;
};

export const Sky = ({ date }: Props) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const gradient = useMemo(() => skyGradient(hour, minute), [hour, minute]);
  const sun = sunPosition(hour, minute);
  const moon = moonPosition(hour, minute);
  const phase = useMemo(() => moonPhase(date), [date.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: gradient,
        overflow: 'hidden',
      }}
    >
      {sun >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${sun * 100}%`,
            top: `${80 - Math.sin(sun * Math.PI) * 60}%`,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #fff7c2 0%, #ffd84d 60%, rgba(255,216,77,0) 100%)',
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(0 0 12px #ffd84d80)',
          }}
        />
      )}
      {moon >= 0 && <Moon position={moon} phase={phase} />}
      {(hour >= 21 || hour < 5) && <Stars />}
    </div>
  );
};

const Moon = ({ position, phase }: { position: number; phase: number }) => {
  // Phase 0 = new (invisible), 0.5 = full, 1 = new again. Use a cosine.
  const lit = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position * 100}%`,
        top: `${72 - Math.sin(position * Math.PI) * 56}%`,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#fff5d6',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 30px rgba(255,245,214,0.5)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: '#1a1340',
          left: `${(1 - lit) * 100}%`,
          top: 0,
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

const STAR_COUNT = 30;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: ((i * 97) % 100) + ((i * 31) % 7) / 7,
  y: (i * 53) % 60,
  size: (i % 3) + 1,
  delay: (i * 0.3) % 4,
}));

const Stars = () => (
  <>
    {STARS.map((s, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          background: '#fff',
          borderRadius: '50%',
          opacity: 0.6,
          animation: `shimmer 3s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }}
      />
    ))}
  </>
);
