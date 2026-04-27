import { useEffect, useState } from 'react';
import { SkyPhase } from '../game/time';

// Tiny garden critters. Bees buzz around bushes during the day. A hopping
// bunny appears occasionally in the meadow. Pure ambience — no game state.

export const Critters = ({ phase }: { phase: SkyPhase }) => {
  return (
    <>
      {phase !== 'night' && phase !== 'dusk' && <Bees />}
      <Bunny phase={phase} />
    </>
  );
};

// Two bees, each anchored to one of the meadow bushes.
const BEE_ANCHORS = [
  { x: 0.08, y: 0.62 },
  { x: 0.92, y: 0.66 },
];

const Bees = () => (
  <>
    {BEE_ANCHORS.map((b, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${b.x * 100}%`,
          top: `${b.y * 100}%`,
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
          zIndex: 4,
          animation: `bee-buzz 1.6s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      >
        <Bee />
      </div>
    ))}
  </>
);

const Bee = () => (
  <svg viewBox="0 0 8 6" width="14" height="11" shapeRendering="crispEdges">
    {/* Body — black + yellow stripes */}
    <ellipse cx="4" cy="3" rx="3" ry="2" fill="#ffd84d" />
    <rect x="2" y="2" width="1" height="2" fill="#3a1a30" />
    <rect x="4" y="2" width="1" height="2" fill="#3a1a30" />
    {/* Head */}
    <rect x="6" y="2" width="1" height="2" fill="#3a1a30" />
    {/* Wings — translucent */}
    <ellipse cx="3" cy="1" rx="1.5" ry="0.8" fill="#dde4ec" opacity="0.7" />
    <ellipse cx="5" cy="1" rx="1.5" ry="0.8" fill="#dde4ec" opacity="0.7" />
    {/* Stinger */}
    <rect x="0.5" y="3" width="1" height="0.6" fill="#3a1a30" />
  </svg>
);

// Bunny that hops across the meadow occasionally — appears, hops 3-4
// times, disappears for a while.
const Bunny = ({ phase }: { phase: SkyPhase }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [hopping, setHopping] = useState(false);

  useEffect(() => {
    if (phase === 'night') {
      setPos(null);
      return;
    }
    let alive = true;

    const cycle = () => {
      if (!alive) return;
      // Spawn at a random edge of the meadow
      const fromLeft = Math.random() < 0.5;
      setFacing(fromLeft ? 'right' : 'left');
      const startY = 0.4 + Math.random() * 0.4;
      setPos({ x: fromLeft ? 0.05 : 0.95, y: startY });

      // Hop sequence — 4 hops across the meadow
      let hops = 0;
      const hop = () => {
        if (!alive) return;
        if (hops >= 4) {
          // Despawn and schedule next visit
          setHopping(false);
          setTimeout(() => setPos(null), 400);
          setTimeout(cycle, 35_000 + Math.random() * 25_000);
          return;
        }
        hops++;
        setHopping(true);
        setPos((p) => {
          if (!p) return p;
          const dx = (fromLeft ? 1 : -1) * (0.06 + Math.random() * 0.04);
          return { x: p.x + dx, y: p.y + (Math.random() - 0.5) * 0.04 };
        });
        setTimeout(() => setHopping(false), 600);
        setTimeout(hop, 1100);
      };
      hop();
    };

    const initial = setTimeout(cycle, 12_000 + Math.random() * 18_000);
    return () => {
      alive = false;
      clearTimeout(initial);
    };
  }, [phase]);

  if (!pos) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: `translate(-50%, -100%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        transition: 'left 0.55s ease-out, top 0.55s ease-out',
        pointerEvents: 'none',
        zIndex: 4,
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.3))',
      }}
    >
      <div
        style={{
          animation: hopping ? 'bunny-hop 0.55s ease-in-out' : undefined,
        }}
      >
        <BunnySprite />
      </div>
      {/* Ground shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 14,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.32)',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
};

const BunnySprite = () => (
  <svg viewBox="0 0 14 12" width="22" height="20" shapeRendering="crispEdges">
    {/* Body */}
    <ellipse cx="7" cy="9" rx="5" ry="3" fill="#fff5dc" />
    {/* Head */}
    <ellipse cx="11" cy="6" rx="3" ry="2.5" fill="#fff5dc" />
    {/* Ears */}
    <rect x="9"  y="0" width="1" height="5" fill="#fff5dc" />
    <rect x="11" y="0" width="1" height="5" fill="#fff5dc" />
    <rect x="9"  y="0" width="1" height="3" fill="#ff9aa9" />
    <rect x="11" y="0" width="1" height="3" fill="#ff9aa9" />
    {/* Eye */}
    <rect x="11" y="5" width="1" height="1" fill="#1a1330" />
    {/* Nose */}
    <rect x="13" y="6" width="1" height="1" fill="#ff5d8f" />
    {/* Tail puff */}
    <ellipse cx="2" cy="8" rx="1.5" ry="1.5" fill="#fff" />
    {/* Front paw */}
    <rect x="9" y="11" width="2" height="1" fill="#e8d8a8" />
    {/* Back paw */}
    <rect x="3" y="11" width="3" height="1" fill="#e8d8a8" />
  </svg>
);
