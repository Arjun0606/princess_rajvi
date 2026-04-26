import { useEffect, useState } from 'react';
import { Pose } from '../game/state';

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

const POSE_LABEL: Record<Pose, string> = {
  default: 'princess',
  coke: 'sipping diet coke',
  jager: 'jäger time',
  joint: 'taking a moment',
  sunflower: 'with a sunflower',
  sleep: 'fast asleep',
};

export const PrincessImage = ({ pose, drunk, high, sleeping, onTap }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPose, setShowPose] = useState<Pose>(sleeping ? 'sleep' : pose);

  useEffect(() => {
    setImageLoaded(false);
    setShowPose(sleeping ? 'sleep' : pose);
  }, [pose, sleeping]);

  // Drunk wobble live keyframe (amplitude grows with intake).
  const wobbleAmp = Math.min(drunk * 1.2, 4);
  const wobbleDur = drunk >= 2 ? 0.8 : drunk >= 1 ? 1.2 : 1.8;
  const stoned = high > 0.5;

  const animation = drunk > 0.3
    ? `wobble-live ${wobbleDur}s ease-in-out infinite`
    : 'float 4.5s ease-in-out infinite';

  const filter = stoned ? `saturate(${1 + high * 0.15})` : undefined;

  return (
    <div
      onClick={onTap}
      onTouchEnd={(e) => {
        e.preventDefault();
        onTap?.();
      }}
      style={{
        position: 'relative',
        width: 240,
        height: 360,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        cursor: 'pointer',
        animation,
        filter,
        transformOrigin: '50% 100%',
        transition: 'filter 0.6s ease',
      }}
    >
      {/* Soft ground shadow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 6,
          transform: 'translateX(-50%)',
          width: 140,
          height: 18,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {drunk > 0.3 && (
        <style>{`
          @keyframes wobble-live {
            0%, 100% { transform: rotate(-${wobbleAmp}deg) translateX(-${wobbleAmp / 3}px); }
            50%      { transform: rotate( ${wobbleAmp}deg) translateX(${wobbleAmp / 3}px); }
          }
        `}</style>
      )}

      {/* Real image (will load when assets land) */}
      <img
        src={POSE_TO_FILE[showPose]}
        alt={POSE_LABEL[showPose] ?? 'princess'}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.25))',
        }}
      />

      {/* Placeholder silhouette while images aren't loaded yet */}
      {!imageLoaded && <Placeholder pose={showPose} />}

      {sleeping && <SleepZ />}
      {high > 0.5 && <SmokeWisp />}
    </div>
  );
};

const Placeholder = ({ pose }: { pose: Pose }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 20,
      gap: 4,
    }}
  >
    {/* head */}
    <div
      style={{
        width: 80,
        height: 90,
        borderRadius: '46% 46% 50% 50%',
        background: 'linear-gradient(180deg, #ffd9b5 0%, #e8b890 100%)',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* hair */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: -10,
          right: -10,
          height: 50,
          background: '#3d220f',
          borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
          zIndex: 0,
        }}
      />
      {/* crown */}
      <div
        style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 50,
          height: 18,
          background: '#ffd84d',
          clipPath: 'polygon(0 100%, 12% 0, 25% 60%, 50% 0, 75% 60%, 88% 0, 100% 100%)',
          zIndex: 1,
        }}
      />
      {/* gem */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          background: '#ff5d8f',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />
      {/* face — eyes + smile */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 18,
          width: 6,
          height: 8,
          background: '#2a1a0e',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 18,
          width: 6,
          height: 8,
          background: '#2a1a0e',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 18,
          height: 8,
          borderBottom: '3px solid #ff4d77',
          borderRadius: '0 0 50% 50%',
        }}
      />
    </div>
    {/* dress */}
    <div
      style={{
        width: 140,
        height: 180,
        background: 'linear-gradient(180deg, #ff8ab3 0%, #ff5d8f 100%)',
        clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.2)',
      }}
    />
    <div style={{ fontSize: 10, color: '#fff', opacity: 0.6, marginTop: 6 }}>
      ({pose} placeholder)
    </div>
  </div>
);

const SleepZ = () => (
  <div
    style={{
      position: 'absolute',
      top: 20,
      right: 30,
      fontWeight: 700,
      fontSize: 22,
      color: 'white',
      textShadow: '0 2px 6px rgba(0,0,0,0.4)',
      animation: 'zzz 2.4s ease-in-out infinite',
    }}
  >
    z
  </div>
);

const SmokeWisp = () => (
  <div
    style={{
      position: 'absolute',
      top: 80,
      left: 70,
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0))',
      filter: 'blur(2px)',
      animation: 'drift 3s ease-out infinite',
      pointerEvents: 'none',
    }}
  />
);
