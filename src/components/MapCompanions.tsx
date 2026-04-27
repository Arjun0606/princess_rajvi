import { useEffect, useRef, useState } from 'react';
import { CompanionId, CompanionMeta, unlockedCompanions } from '../game/companions';
import { GameState } from '../game/state';

type Pos = { x: number; y: number };

// Each unlocked companion appears on the map. Bird and cat WANDER
// independently. The corgi (Lord Bigsby) FOLLOWS the princess like a
// loyal pet — same trick the user used in princess_game_pixel.
export const MapCompanions = ({
  state,
  princessX,
  princessY,
}: {
  state: GameState;
  princessX: number;
  princessY: number;
}) => {
  const companions = unlockedCompanions(state);
  if (companions.length === 0) return null;
  return (
    <>
      {companions.map((c, i) =>
        c.id === 'corgi' ? (
          <Follower key={c.id} meta={c} princessX={princessX} princessY={princessY} />
        ) : (
          <Wanderer key={c.id} meta={c} index={i} />
        ),
      )}
    </>
  );
};

const SPAWN_AREAS: Record<number, Pos> = {
  0: { x: 0.42, y: 0.45 },
  1: { x: 0.55, y: 0.55 },
  2: { x: 0.36, y: 0.6 },
};

const Wanderer = ({ meta, index }: { meta: CompanionMeta; index: number }) => {
  const [pos, setPos] = useState<Pos>(SPAWN_AREAS[index] ?? { x: 0.5, y: 0.5 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [duration, setDuration] = useState(4000);

  useEffect(() => {
    let alive = true;
    const step = () => {
      if (!alive) return;
      // Stay in the central walkable zone — avoid station corners.
      const next = {
        x: 0.32 + Math.random() * 0.36,
        y: 0.4 + Math.random() * 0.28,
      };
      setPos((prev) => {
        setFacing(next.x >= prev.x ? 'right' : 'left');
        return next;
      });
      const dur = 3500 + Math.random() * 2500;
      setDuration(dur);
      const wait = dur + 8000 + Math.random() * 9000;
      setTimeout(step, wait);
    };
    const initial = setTimeout(step, 2000 + index * 1800);
    return () => {
      alive = false;
      clearTimeout(initial);
    };
  }, [index]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: `translate(-50%, -100%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        transition: `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out`,
        zIndex: 4,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.3))',
      }}
    >
      {/* Ground shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: 4,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.32)',
          filter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <CompanionSprite id={meta.id} />
    </div>
  );
};

const CompanionSprite = ({ id }: { id: CompanionId }) => {
  switch (id) {
    case 'bird':  return <Pigeon />;
    case 'corgi': return <Corgi />;
    case 'cat':   return <Cat />;
  }
};

// Corgi follows the princess: every ~700ms snap to a position one step
// behind her direction of travel. Smooth CSS transition makes him trot.
const Follower = ({
  meta,
  princessX,
  princessY,
}: {
  meta: CompanionMeta;
  princessX: number;
  princessY: number;
}) => {
  const [pos, setPos] = useState<Pos>({ x: princessX - 0.06, y: princessY });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const last = useRef<Pos>({ x: princessX, y: princessY });

  useEffect(() => {
    const t = setInterval(() => {
      // Trot to ~6% behind the princess (offset opposite her travel dir).
      const dx = princessX - last.current.x;
      const dy = princessY - last.current.y;
      const moving = Math.hypot(dx, dy) > 0.005;
      if (moving) {
        setFacing(dx >= 0 ? 'right' : 'left');
        const offsetX = dx >= 0 ? -0.06 : 0.06;
        setPos({ x: princessX + offsetX, y: princessY + 0.015 });
      } else {
        // Princess is idle — sit beside her, slight offset
        setPos((p) => ({
          x: princessX + (p.x < princessX ? -0.06 : 0.06),
          y: princessY + 0.015,
        }));
      }
      last.current = { x: princessX, y: princessY };
    }, 700);
    return () => clearInterval(t);
  }, [princessX, princessY]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: `translate(-50%, -100%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        transition: 'left 0.7s ease-out, top 0.7s ease-out',
        zIndex: 5,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.3))',
      }}
    >
      {/* Ground shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: 4,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.32)',
          filter: 'blur(1px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <CompanionSprite id={meta.id} />
    </div>
  );
};

const Pigeon = () => (
  <svg viewBox="0 0 14 12" width="22" height="20" shapeRendering="crispEdges">
    {/* Body */}
    <rect x="3" y="4" width="8" height="5" fill="#bcbcd0" />
    <rect x="3" y="4" width="8" height="1" fill="#dadaee" />
    <rect x="3" y="8" width="8" height="1" fill="#888aa0" />
    {/* Head */}
    <rect x="9" y="2" width="4" height="3" fill="#bcbcd0" />
    <rect x="9" y="2" width="4" height="1" fill="#dadaee" />
    {/* Beak */}
    <rect x="13" y="3" width="1" height="1" fill="#ff9a3c" />
    {/* Eye */}
    <rect x="11" y="3" width="1" height="1" fill="#1a1330" />
    {/* Wing */}
    <rect x="4" y="5" width="5" height="2" fill="#888aa0" />
    {/* Feet */}
    <rect x="5" y="9" width="1" height="2" fill="#ff9a3c" />
    <rect x="8" y="9" width="1" height="2" fill="#ff9a3c" />
    {/* Iridescent neck dot */}
    <rect x="9" y="4" width="1" height="1" fill="#7ad6c8" />
  </svg>
);

const Corgi = () => (
  <svg viewBox="0 0 18 12" width="32" height="22" shapeRendering="crispEdges">
    {/* Body */}
    <rect x="3" y="5" width="11" height="4" fill="#e89a4a" />
    <rect x="3" y="5" width="11" height="1" fill="#f4b97a" />
    <rect x="3" y="8" width="11" height="1" fill="#a96820" />
    {/* White belly */}
    <rect x="5" y="7" width="7" height="2" fill="#fff5dc" />
    {/* Head */}
    <rect x="11" y="3" width="5" height="4" fill="#e89a4a" />
    <rect x="11" y="3" width="5" height="1" fill="#f4b97a" />
    {/* Snout / muzzle */}
    <rect x="15" y="5" width="1" height="2" fill="#fff5dc" />
    {/* Eye + nose */}
    <rect x="14" y="4" width="1" height="1" fill="#1a1330" />
    <rect x="16" y="5" width="1" height="1" fill="#1a1330" />
    {/* Ears (perky) */}
    <rect x="11" y="2" width="1" height="2" fill="#a96820" />
    <rect x="14" y="2" width="1" height="2" fill="#a96820" />
    {/* Legs (chibi) */}
    <rect x="4"  y="9" width="2" height="2" fill="#a96820" />
    <rect x="7"  y="9" width="2" height="2" fill="#a96820" />
    <rect x="11" y="9" width="2" height="2" fill="#a96820" />
    <rect x="14" y="9" width="1" height="2" fill="#a96820" />
    {/* Tiny tail */}
    <rect x="2" y="6" width="1" height="2" fill="#fff5dc" />
  </svg>
);

const Cat = () => (
  <svg viewBox="0 0 16 12" width="28" height="22" shapeRendering="crispEdges">
    {/* Body */}
    <rect x="2" y="6" width="10" height="3" fill="#3a2a3a" />
    <rect x="2" y="6" width="10" height="1" fill="#5a3a5a" />
    {/* Head */}
    <rect x="10" y="3" width="5" height="4" fill="#3a2a3a" />
    <rect x="10" y="3" width="5" height="1" fill="#5a3a5a" />
    {/* Ears (triangle pixels) */}
    <rect x="10" y="2" width="1" height="1" fill="#3a2a3a" />
    <rect x="14" y="2" width="1" height="1" fill="#3a2a3a" />
    {/* Eyes — green */}
    <rect x="11" y="4" width="1" height="1" fill="#7adb7a" />
    <rect x="13" y="4" width="1" height="1" fill="#7adb7a" />
    {/* Nose / mouth */}
    <rect x="12" y="5" width="1" height="1" fill="#ff9aa9" />
    {/* Legs */}
    <rect x="3"  y="9" width="2" height="2" fill="#1a131a" />
    <rect x="6"  y="9" width="2" height="2" fill="#1a131a" />
    <rect x="9"  y="9" width="2" height="2" fill="#1a131a" />
    {/* Curl tail */}
    <rect x="0" y="5" width="1" height="3" fill="#3a2a3a" />
    <rect x="1" y="4" width="1" height="2" fill="#3a2a3a" />
    {/* Crown — court advisor */}
    <rect x="11" y="1" width="3" height="1" fill="#ffd84d" />
    <rect x="11" y="0" width="1" height="1" fill="#ffd84d" />
    <rect x="13" y="0" width="1" height="1" fill="#ffd84d" />
  </svg>
);
