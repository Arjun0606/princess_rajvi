import { useEffect, useRef, useState } from 'react';
import { Pose } from '../game/state';
import { PixelPrincess } from './PixelPrincess';

type Puff = { id: number; t: number; dx: number };
let puffId = 0;

type Props = {
  pose: Pose;
  drunk: number;
  high: number;
  // Target horizontal position 0..1 across the playable floor.
  // When this changes, princess walks to it.
  targetX: number;
  // Called when princess arrives at the target.
  onArrive?: (x: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
  // World vertical offset — where the floor is on the bg (vh from bottom).
  floorVh?: number;
  // Sprite height (px) — small Stardew-tier sprite.
  spriteHeight?: number;
};

const LONG_PRESS_MS = 600;
// How fast princess walks (full screen traversal in ms).
const WALK_SPEED_MS = 4500;

export const WalkingPrincess = ({
  pose,
  drunk,
  high,
  targetX,
  onArrive,
  onTap,
  onLongPress,
  floorVh = 12,
  spriteHeight = 110,
}: Props) => {
  const [currentX, setCurrentX] = useState(targetX);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [walking, setWalking] = useState(false);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const arriveCb = useRef(onArrive);
  arriveCb.current = onArrive;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef<number>(0);

  // Drive the walk animation when targetX changes.
  useEffect(() => {
    if (Math.abs(targetX - currentX) < 0.01) {
      setWalking(false);
      return;
    }
    const newFacing = targetX > currentX ? 'right' : 'left';
    setFacing(newFacing);
    setWalking(true);

    const distance = Math.abs(targetX - currentX);
    const duration = Math.max(400, distance * WALK_SPEED_MS);

    // Trigger the CSS transition by updating currentX next tick.
    const nudge = requestAnimationFrame(() => setCurrentX(targetX));
    const arriveTimer = setTimeout(() => {
      setWalking(false);
      arriveCb.current?.(targetX);
    }, duration + 60);

    return () => {
      cancelAnimationFrame(nudge);
      clearTimeout(arriveTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX]);

  // CSS duration tracks the actual distance to the target so princess always
  // walks at constant speed regardless of how far she's going.
  const transitionDuration = (() => {
    const distance = Math.abs(targetX - currentX);
    return Math.max(400, distance * WALK_SPEED_MS);
  })();

  // While walking, periodically drop a dust puff behind the princess.
  useEffect(() => {
    if (!walking) return;
    const interval = setInterval(() => {
      setPuffs((prev) => [
        ...prev.slice(-6),
        {
          id: ++puffId,
          t: Date.now(),
          dx: (Math.random() - 0.5) * 6,
        },
      ]);
    }, 220);
    return () => clearInterval(interval);
  }, [walking]);

  // GC old puffs.
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
      onPointerUp={() => {
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
        left: `${currentX * 100}%`,
        bottom: `${floorVh}vh`,
        transform: `translateX(-50%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        transition: `left ${transitionDuration}ms linear`,
        width: spriteHeight * 0.56, // 28/50 ratio
        height: spriteHeight,
        zIndex: 5,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        animation: walking ? 'walk-bob 0.36s steps(2) infinite' : undefined,
      }}
    >
      <PixelPrincess pose={pose} drunk={drunk} high={high} />

      {/* Walking dust puffs: small chunky circles trail behind her feet */}
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
