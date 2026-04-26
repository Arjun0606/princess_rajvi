import { useEffect, useState } from 'react';
import { SkyPhase } from '../game/time';

type Props = {
  phase: SkyPhase;
};

// Drifting pixel clouds during day, shooting stars at night, occasional
// butterflies during day, rare lone bird at dawn/dusk. All purely visual.

type Cloud = { id: number; top: number; size: number; speed: number };
type Butterfly = { id: number; startTop: number; speed: number };
type Shooter = { id: number; startTop: number; startLeft: number; angle: number };

let cid = 0;

export const AtmosphericEvents = ({ phase }: Props) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const [shooters, setShooters] = useState<Shooter[]>([]);

  // Clouds during daytime.
  useEffect(() => {
    if (phase !== 'day' && phase !== 'dawn' && phase !== 'dusk') {
      setClouds([]);
      return;
    }
    const next: Cloud[] = Array.from({ length: 4 }, (_, i) => ({
      id: ++cid,
      top: 4 + i * 6 + (i % 2) * 3,
      size: 0.8 + Math.random() * 0.6,
      speed: 90 + Math.random() * 40,
    }));
    setClouds(next);
  }, [phase]);

  // Random butterfly visit during day. ~once every 35-90s.
  useEffect(() => {
    if (phase !== 'day') {
      setButterflies([]);
      return;
    }
    const schedule = () => {
      const t = setTimeout(() => {
        setButterflies((prev) => [
          ...prev.slice(-2),
          {
            id: ++cid,
            startTop: 30 + Math.random() * 30,
            speed: 14 + Math.random() * 6,
          },
        ]);
        schedule();
      }, 35000 + Math.random() * 55000);
      return t;
    };
    const handle = schedule();
    return () => clearTimeout(handle);
  }, [phase]);

  // Random shooting star at night. Rare ~once every 60-120s.
  useEffect(() => {
    if (phase !== 'night') {
      setShooters([]);
      return;
    }
    const schedule = () => {
      const t = setTimeout(() => {
        setShooters((prev) => [
          ...prev.slice(-1),
          {
            id: ++cid,
            startTop: 5 + Math.random() * 25,
            startLeft: 60 + Math.random() * 30,
            angle: 25 + Math.random() * 15,
          },
        ]);
        schedule();
      }, 60000 + Math.random() * 60000);
      return t;
    };
    const handle = schedule();
    return () => clearTimeout(handle);
  }, [phase]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {clouds.map((c) => (
        <CloudSprite key={c.id} cloud={c} phase={phase} />
      ))}
      {butterflies.map((b) => (
        <ButterflySprite key={b.id} b={b} />
      ))}
      {shooters.map((s) => (
        <ShootingStar key={s.id} s={s} />
      ))}
    </div>
  );
};

const CloudSprite = ({ cloud, phase }: { cloud: Cloud; phase: SkyPhase }) => {
  const tint =
    phase === 'dawn' ? 'rgba(255, 220, 200, 0.85)' :
    phase === 'dusk' ? 'rgba(255, 180, 170, 0.8)' :
    'rgba(255, 255, 255, 0.85)';
  return (
    <svg
      viewBox="0 0 16 6"
      style={{
        position: 'absolute',
        top: `${cloud.top}%`,
        width: 80 * cloud.size,
        height: 30 * cloud.size,
        animation: `cloud-drift ${cloud.speed}s linear infinite`,
        animationDelay: `-${cloud.id * 7}s`,
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.05))',
      }}
      shapeRendering="crispEdges"
    >
      <g fill={tint}>
        <rect x="2" y="2" width="12" height="2" />
        <rect x="3" y="1" width="3" height="1" />
        <rect x="7" y="0" width="4" height="2" />
        <rect x="10" y="1" width="3" height="1" />
        <rect x="1" y="3" width="14" height="1" />
        <rect x="2" y="4" width="12" height="1" />
      </g>
    </svg>
  );
};

const ButterflySprite = ({ b }: { b: Butterfly }) => (
  <div
    style={{
      position: 'absolute',
      top: `${b.startTop}%`,
      animation: `butterfly-cross ${b.speed}s linear forwards`,
    }}
  >
    <svg viewBox="0 0 8 6" width="32" height="24" shapeRendering="crispEdges">
      <g style={{ animation: 'butterfly-flap 0.18s ease-in-out infinite alternate', transformOrigin: '50% 50%' }}>
        <rect x="0" y="1" width="3" height="2" fill="#ff5d8f" />
        <rect x="1" y="0" width="2" height="1" fill="#ff5d8f" />
        <rect x="0" y="3" width="2" height="1" fill="#c83864" />
        <rect x="5" y="1" width="3" height="2" fill="#ff5d8f" />
        <rect x="5" y="0" width="2" height="1" fill="#ff5d8f" />
        <rect x="6" y="3" width="2" height="1" fill="#c83864" />
        <rect x="3" y="1" width="2" height="3" fill="#3a1d0a" />
      </g>
    </svg>
  </div>
);

const ShootingStar = ({ s }: { s: Shooter }) => (
  <div
    style={{
      position: 'absolute',
      top: `${s.startTop}%`,
      left: `${s.startLeft}%`,
      animation: `shoot 1.2s ease-out forwards`,
      transform: `rotate(${s.angle}deg)`,
    }}
  >
    <div
      style={{
        width: 2,
        height: 2,
        background: '#fff',
        boxShadow:
          '0 0 8px #fff, -4px 0 6px #fff, -10px 0 8px rgba(255,255,255,0.6), -20px 0 14px rgba(255,255,255,0.4)',
      }}
    />
  </div>
);
