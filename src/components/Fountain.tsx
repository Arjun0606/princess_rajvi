import { useEffect, useState } from 'react';

// Central pixel-art fountain with animated water arcs. Replaces the flat
// rose-medallion at the path crossing. Stardew Valley would put a real
// focal point here, so we do the same: stone pool + tiered basin + water
// jets shooting up + ripples on the surface + a thin reflection.

type Drop = { id: number; angle: number; phase: number };

export const Fountain = ({ xPct = 0.5, yPct = 0.6 }: { xPct?: number; yPct?: number }) => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [tick, setTick] = useState(0);

  // Continuously emit water droplets from the top of the fountain.
  useEffect(() => {
    let id = 0;
    const t = setInterval(() => {
      setDrops((prev) => {
        const next = [
          ...prev.slice(-12),
          { id: ++id, angle: -90 + (Math.random() - 0.5) * 60, phase: Math.random() * 0.3 },
        ];
        return next;
      });
    }, 220);
    return () => clearInterval(t);
  }, []);

  // Drive the ripple animation
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct * 100}%`,
        top: `${yPct * 100}%`,
        transform: 'translate(-50%, -55%)',
        width: 52,
        height: 60,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {/* Stone outer pool */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
          width: 52,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 30%, #fff5dc 0%, #c89a5e 70%, #8a5230 100%)',
          boxShadow: 'inset 0 -2px 0 #6b3a20, 0 2px 0 rgba(0,0,0,0.25)',
        }}
      />
      {/* Inner water */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 2,
          transform: 'translateX(-50%)',
          width: 42,
          height: 10,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 30%, #b6e0ff 0%, #6ab4dd 70%, #3a7dab 100%)',
          boxShadow: 'inset 0 1px 0 #d4ecff, inset 0 -1px 0 #2a5d8a',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 2 + ((tick * 3) % 32),
            height: 2 + ((tick * 3) % 32),
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '50%',
            opacity: 1 - ((tick * 3) % 32) / 32,
          }}
        />
      </div>
      {/* Stone pillar */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 10,
          transform: 'translateX(-50%)',
          width: 10,
          height: 18,
          background:
            'linear-gradient(90deg, #c89a5e 0%, #fff5dc 30%, #c89a5e 70%, #8a5230 100%)',
          boxShadow: 'inset 0 0 0 1px #6b3a20',
        }}
      />
      {/* Tiered basin */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 24,
          transform: 'translateX(-50%)',
          width: 22,
          height: 8,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, #fff5dc 0%, #c89a5e 60%, #6b3a20 100%)',
          boxShadow: 'inset 0 -1px 0 #6b3a20',
        }}
      />
      {/* Top water pool */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 28,
          transform: 'translateX(-50%)',
          width: 12,
          height: 4,
          borderRadius: '50%',
          background: '#6ab4dd',
          boxShadow: 'inset 0 1px 0 #b6e0ff',
        }}
      />
      {drops.map((d) => (
        <Droplet key={d.id} angle={d.angle} phase={d.phase} />
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.32)',
          filter: 'blur(2px)',
          zIndex: -1,
        }}
      />
    </div>
  );
};

const Droplet = ({ angle, phase }: { angle: number; phase: number }) => {
  const dx = Math.cos((angle * Math.PI) / 180) * 8;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 32,
        width: 2,
        height: 2,
        background: '#d4ecff',
        boxShadow: '0 0 3px #b6e0ff',
        borderRadius: '50%',
        // @ts-expect-error css var passthrough
        '--dx': `${dx}px`,
        animation: `fountain-drop 0.9s ease-out ${phase}s forwards`,
        pointerEvents: 'none',
      }}
    />
  );
};
