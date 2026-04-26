import { useState } from 'react';
import { Pose } from '../game/state';
import { PixelPrincess } from './PixelPrincess';

type Props = {
  pose: Pose;
  drunk: number;
  high: number;
  sleeping: boolean;
  onTap?: () => void;
};

const POSE_TO_FILE: Record<Pose, string> = {
  default: '/art/princess-default.png',
  coke: '/art/princess-coke.png',
  jager: '/art/princess-jager.png',
  joint: '/art/princess-joint.png',
  sunflower: '/art/princess-sunflower.png',
  sleep: '/art/princess-sleep.png',
};

// The procedural pixel-art princess is the default. If a real PNG asset
// exists at /art/princess-*.png it loads on top and replaces the procedural
// princess once the image is ready.
export const PrincessImage = ({ pose, drunk, high, sleeping, onTap }: Props) => {
  const [imgReady, setImgReady] = useState(false);
  const showPose = sleeping ? 'sleep' : pose;

  return (
    <div
      onClick={onTap}
      onTouchEnd={(e) => {
        e.preventDefault();
        onTap?.();
      }}
      style={{
        position: 'relative',
        width: 252,
        height: 450,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <PixelPrincess pose={showPose} drunk={drunk} high={high} size={9} />

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
