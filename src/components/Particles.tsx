import { useEffect, useState } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
};

// Atmospheric ambient particles tied to time of day:
//   day  -> drifting sunflower petals
//   dusk -> golden dust motes
//   night -> blinking fireflies
//   dawn -> nothing (calm)

type Particle = {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
};

let pid = 0;

export const Particles = ({ phase }: Props) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (phase === 'dawn') {
      setParticles([]);
      return;
    }
    const count = phase === 'night' ? 12 : phase === 'dusk' ? 14 : 8;
    const next: Particle[] = Array.from({ length: count }, () => ({
      id: ++pid,
      left: Math.random() * 100,
      top: Math.random() * 80,
      size: phase === 'day' ? 14 + Math.random() * 10 : 5 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 8 + Math.random() * 8,
    }));
    setParticles(next);
  }, [phase]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 6,
      }}
    >
      {particles.map((p) => (
        <Bit key={p.id} p={p} phase={phase} />
      ))}
    </div>
  );
};

const Bit = ({ p, phase }: { p: Particle; phase: SkyPhase }) => {
  if (phase === 'night') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: p.size,
          background: '#fffbcc',
          borderRadius: '50%',
          boxShadow: '0 0 10px #fffbcc, 0 0 20px #ffd84d80',
          animation: `firefly ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }}
      />
    );
  }

  if (phase === 'dusk') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: p.size,
          background: '#ffd84d',
          borderRadius: '50%',
          opacity: 0.7,
          boxShadow: '0 0 6px #ffd84d',
          animation: `firefly ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }}
      />
    );
  }

  // day — drifting sunflower petals (chunky pixel-friendly diamonds)
  return (
    <div
      style={{
        position: 'absolute',
        left: `${p.left}%`,
        top: 0,
        width: p.size,
        height: p.size * 1.4,
        background: '#ffd84d',
        clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        opacity: 0.55,
        animation: `petal ${p.duration}s linear infinite`,
        animationDelay: `${p.delay}s`,
      }}
    />
  );
};
