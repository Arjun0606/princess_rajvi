import { useEffect, useRef, useState } from 'react';
import { Pose } from '../game/state';
import { PixelPrincess } from './PixelPrincess';

type Puff = { id: number; t: number; dx: number };
let puffId = 0;

type Props = {
  pose: Pose;
  drunk: number;
  high: number;
  // Target position 0..1 in BOTH dimensions on the map.
  targetX: number;
  targetY: number;
  onArrive?: (x: number, y: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
  spriteHeight?: number;
};

const LONG_PRESS_MS = 600;
// Pixels per second on the map (computed from map size at runtime via the
// distance between target/current positions). For our 1.6 aspect ratio map
// at typical phone height, full-diagonal traversal in ~5s feels right.
const TRAVERSAL_MS = 5500;

export const WalkingPrincess = ({
  pose,
  drunk,
  high,
  targetX,
  targetY,
  onArrive,
  onTap,
  onLongPress,
  spriteHeight = 86,
}: Props) => {
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [walking, setWalking] = useState(false);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const arriveCb = useRef(onArrive);
  arriveCb.current = onArrive;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef<number>(0);

  // Walk to a new target whenever it changes.
  useEffect(() => {
    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 0.005) {
      setWalking(false);
      return;
    }
    setFacing(dx >= 0 ? 'right' : 'left');
    setWalking(true);

    const duration = Math.max(400, distance * TRAVERSAL_MS);

    const nudge = requestAnimationFrame(() => setPos({ x: targetX, y: targetY }));
    const arriveTimer = setTimeout(() => {
      setWalking(false);
      arriveCb.current?.(targetX, targetY);
    }, duration + 60);

    return () => {
      cancelAnimationFrame(nudge);
      clearTimeout(arriveTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX, targetY]);

  const transitionDuration = (() => {
    const dx = targetX - pos.x;
    const dy = targetY - pos.y;
    const distance = Math.hypot(dx, dy);
    return Math.max(400, distance * TRAVERSAL_MS);
  })();

  // Walking dust puffs
  useEffect(() => {
    if (!walking) return;
    const interval = setInterval(() => {
      setPuffs((prev) => [
        ...prev.slice(-6),
        { id: ++puffId, t: Date.now(), dx: (Math.random() - 0.5) * 6 },
      ]);
    }, 220);
    return () => clearInterval(interval);
  }, [walking]);

  useEffect(() => {
    const t = setInterval(() => {
      setPuffs((prev) => prev.filter((p) => Date.now() - p.t < 700));
    }, 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      onPointerDown={() => {
        startedAt.current = Date.now();
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
          onLongPress?.();
          longPressTimer.current = null;
        }, LONG_PRESS_MS);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
          if (Date.now() - startedAt.current < 220) onTap?.();
        }
      }}
      onPointerCancel={() => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }}
      data-drop-target="princess"
      style={{
        position: 'absolute',
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        // Anchor at character's feet (bottom-center).
        transform: `translate(-50%, -100%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        transition: `left ${transitionDuration}ms linear, top ${transitionDuration}ms linear`,
        width: spriteHeight * 0.56,
        height: spriteHeight,
        zIndex: 5,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        animation: walking ? 'walk-bob 0.36s steps(2) infinite' : undefined,
        filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.3))',
      }}
    >
      {/* Ground shadow — soft ellipse at her feet */}
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: 8,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.32)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <PixelPrincess pose={pose} drunk={drunk} high={high} />

      {puffs.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: 2,
            left: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'rgba(255, 235, 200, 0.7)',
            transform: 'translateX(-50%)',
            // @ts-expect-error css var passthrough
            '--dx': `${p.dx}px`,
            animation: 'dust-puff 0.7s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
};
