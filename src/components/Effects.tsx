import { useEffect, useState } from 'react';
import { ActionKind } from '../game/state';

type Particle = {
  id: number;
  kind: 'fizz' | 'smoke' | 'sparkle' | 'heart';
  x: number;
  y: number;
  delay: number;
};

type Props = {
  trigger: { kind: ActionKind; at: number } | null;
};

let pid = 0;

export const Effects = ({ trigger }: Props) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const created: Particle[] = [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.55;

    if (trigger.kind === 'coke') {
      for (let i = 0; i < 12; i++) {
        created.push({
          id: ++pid,
          kind: 'fizz',
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 30,
          delay: i * 35,
        });
      }
    } else if (trigger.kind === 'weed') {
      for (let i = 0; i < 8; i++) {
        created.push({
          id: ++pid,
          kind: 'smoke',
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 30,
          delay: i * 80,
        });
      }
    } else if (trigger.kind === 'jager') {
      for (let i = 0; i < 10; i++) {
        created.push({
          id: ++pid,
          kind: 'sparkle',
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 40,
          delay: i * 50,
        });
      }
    } else if (trigger.kind === 'water') {
      for (let i = 0; i < 6; i++) {
        created.push({
          id: ++pid,
          kind: 'heart',
          x: cx + (Math.random() - 0.5) * 100,
          y: cy + 40 + (Math.random() - 0.5) * 30,
          delay: i * 100,
        });
      }
    } else if (trigger.kind === 'tap') {
      for (let i = 0; i < 4; i++) {
        created.push({
          id: ++pid,
          kind: 'heart',
          x: cx + (Math.random() - 0.5) * 60,
          y: cy + (Math.random() - 0.5) * 20,
          delay: i * 60,
        });
      }
    }

    setParticles((prev) => [...prev, ...created]);
    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !created.some((c) => c.id === p.id)));
    }, 1800);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {particles.map((p) => (
        <ParticleVisual key={p.id} p={p} />
      ))}
    </div>
  );
};

const ParticleVisual = ({ p }: { p: Particle }) => {
  const base = {
    position: 'absolute' as const,
    left: p.x,
    top: p.y,
    animationDelay: `${p.delay}ms`,
  };

  if (p.kind === 'fizz') {
    return (
      <div
        style={{
          ...base,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 0 6px #fff',
          animation: 'fizz 1.4s ease-out forwards',
        }}
      />
    );
  }
  if (p.kind === 'smoke') {
    return (
      <div
        style={{
          ...base,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0))',
          animation: 'drift 2.4s ease-out forwards',
          filter: 'blur(2px)',
        }}
      />
    );
  }
  if (p.kind === 'sparkle') {
    return (
      <div
        style={{
          ...base,
          width: 6,
          height: 6,
          background: '#ffd84d',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 8px #ffd84d',
          animation: 'fizz 1.6s ease-out forwards',
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        fontSize: 18,
        animation: 'fizz 1.6s ease-out forwards',
      }}
    >
      🌻
    </div>
  );
};
