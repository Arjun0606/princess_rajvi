import { useEffect, useState } from 'react';
import { SkyPhase } from '../game/time';

type Bug = { id: number; x: number; y: number; delay: number; duration: number };

// Atmospheric creatures that wander the courtyard. Day → butterflies cross
// the screen. Night → fireflies blink in place. Dusk/dawn → soft drifting
// rose petals. All purely decorative, no interaction.
export const AmbientLife = ({ phase }: { phase: SkyPhase }) => {
  const [butterflies, setButterflies] = useState<Bug[]>([]);
  const [fireflies, setFireflies] = useState<Bug[]>([]);
  const [petals, setPetals] = useState<Bug[]>([]);

  // Butterflies: only during day, cross the screen on a loose curve every
  // ~10s. Pre-seed three so the world looks alive immediately.
  useEffect(() => {
    if (phase !== 'day' && phase !== 'dawn') {
      setButterflies([]);
      return;
    }
    const seed = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + i * 30,
      y: 30 + i * 12,
      delay: i * 2200,
      duration: 11000 + Math.random() * 4000,
    }));
    setButterflies(seed);
    const t = setInterval(() => {
      setButterflies((prev) => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          x: 0,
          y: 25 + Math.random() * 30,
          delay: 0,
          duration: 10000 + Math.random() * 4000,
        },
      ]);
    }, 8000);
    return () => clearInterval(t);
  }, [phase]);

  // Fireflies: only at dusk/night. Place 8 fixed-position flickerers.
  useEffect(() => {
    if (phase !== 'night' && phase !== 'dusk') {
      setFireflies([]);
      return;
    }
    setFireflies(
      Array.from({ length: phase === 'night' ? 10 : 5 }, (_, i) => ({
        id: i,
        x: 12 + Math.random() * 76,
        y: 22 + Math.random() * 56,
        delay: Math.random() * 2600,
        duration: 2400 + Math.random() * 1500,
      })),
    );
  }, [phase]);

  // Petals: occasional during dawn/day, more at dusk. None at night.
  useEffect(() => {
    if (phase === 'night') {
      setPetals([]);
      return;
    }
    const cadence = phase === 'dusk' ? 1800 : 4500;
    const t = setInterval(() => {
      setPetals((prev) => [
        ...prev.slice(-5),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: 0,
          delay: 0,
          duration: 9000 + Math.random() * 6000,
        },
      ]);
    }, cadence);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 4,
        overflow: 'hidden',
      }}
    >
      {butterflies.map((b) => (
        <Butterfly key={b.id} {...b} />
      ))}
      {fireflies.map((f) => (
        <Firefly key={f.id} {...f} />
      ))}
      {petals.map((p) => (
        <Petal key={p.id} {...p} />
      ))}
    </div>
  );
};

const Butterfly = ({ y, delay, duration }: Bug) => (
  <div
    style={{
      position: 'absolute',
      top: `${y}%`,
      left: 0,
      // `both` so pre-delay frame uses 0% (off-screen right) — otherwise
      // the butterfly briefly snaps to left:0 during its animation-delay.
      animation: `butterfly-cross ${duration}ms linear ${delay}ms infinite both`,
      willChange: 'transform',
    }}
  >
    <div
      style={{
        animation: 'butterfly-flap 220ms steps(2) infinite alternate',
        transformOrigin: 'center',
        fontSize: 14,
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.18))',
      }}
    >
      🦋
    </div>
  </div>
);

const Firefly = ({ x, y, delay, duration }: Bug) => (
  <div
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: '#fff8a8',
      boxShadow: '0 0 8px 2px #fff080, 0 0 14px 6px rgba(255,224,120,0.45)',
      animation: `firefly ${duration}ms ease-in-out ${delay}ms infinite`,
    }}
  />
);

const Petal = ({ x, duration }: Bug) => (
  <div
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: 0,
      width: 6,
      height: 6,
      background: '#ff8ab3',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      animation: `petal ${duration}ms linear forwards`,
      opacity: 0.7,
    }}
  />
);
