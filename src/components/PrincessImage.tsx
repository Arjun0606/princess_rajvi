import { useState } from 'react';
import { Pose } from '../game/state';
import { PixelPrincess } from './PixelPrincess';

type Props = {
  pose: Pose;
  drunk: number;
  high: number;
  sleeping: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
};

const POSE_TO_FILE: Record<Pose, string> = {
  default: '/art/princess-default.png',
  coke: '/art/princess-coke.png',
  jager: '/art/princess-jager.png',
  joint: '/art/princess-joint.png',
  sunflower: '/art/princess-sunflower.png',
  sleep: '/art/princess-sleep.png',
};

const LONG_PRESS_MS = 600;

// Princess fills its parent container. The parent (App.tsx) decides the
// vh-relative size so layout works on every phone height.
export const PrincessImage = ({ pose, drunk, high, sleeping, onTap, onLongPress }: Props) => {
  const [imgReady, setImgReady] = useState(false);
  const [pressed, setPressed] = useState(false);
  const showPose = sleeping ? 'sleep' : pose;

  const longPressTimer = (() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    return {
      start: () => {
        if (t) clearTimeout(t);
        t = setTimeout(() => {
          onLongPress?.();
          t = null;
        }, LONG_PRESS_MS);
      },
      cancel: () => {
        if (t) {
          clearTimeout(t);
          t = null;
          return false;
        }
        return true;
      },
    };
  })();

  return (
    <div
      onPointerDown={() => {
        setPressed(true);
        longPressTimer.start();
      }}
      onPointerUp={() => {
        setPressed(false);
        const wasShortPress = longPressTimer.cancel();
        if (wasShortPress) onTap?.();
      }}
      onPointerCancel={() => {
        setPressed(false);
        longPressTimer.cancel();
      }}
      onPointerLeave={() => {
        if (pressed) {
          setPressed(false);
          longPressTimer.cancel();
        }
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'manipulation',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transformOrigin: '50% 100%',
        transition: 'transform 0.15s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      <PixelPrincess pose={showPose} drunk={drunk} high={high} />

      <img
        key={showPose}
        src={POSE_TO_FILE[showPose]}
        alt=""
        onLoad={() => setImgReady(true)}
        onError={() => setImgReady(false)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          opacity: imgReady ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.25))',
        }}
      />
    </div>
  );
};
