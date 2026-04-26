import { useState } from 'react';
import { phaseFor, SkyPhase } from '../game/time';

type Props = {
  date: Date;
};

const PHASE_TO_FILE: Record<SkyPhase, string> = {
  dawn: '/art/bg-dawn.png',
  day: '/art/bg-day.png',
  dusk: '/art/bg-dusk.png',
  night: '/art/bg-night.png',
};

const PHASE_FALLBACK_GRADIENT: Record<SkyPhase, string> = {
  dawn: 'linear-gradient(180deg, #ffd1bd 0%, #ff8aae 100%)',
  day: 'linear-gradient(180deg, #aee3ff 0%, #ffd6ec 100%)',
  dusk: 'linear-gradient(180deg, #ffb88c 0%, #ff5d8f 100%)',
  night: 'linear-gradient(180deg, #1a1340 0%, #4a2266 100%)',
};

// Each time-of-day variant is a generated DALL-E scene with princess baked
// in. Phases crossfade smoothly when the clock crosses a boundary.
export const Background = ({ date }: Props) => {
  const phase = phaseFor(date.getHours());
  const [imgReady, setImgReady] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Fallback gradient under the image (visible while the PNG loads). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: PHASE_FALLBACK_GRADIENT[phase],
        }}
      />
      <img
        key={phase}
        src={PHASE_TO_FILE[phase]}
        alt=""
        onLoad={() => setImgReady(true)}
        onError={() => setImgReady(false)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          opacity: imgReady ? 1 : 0,
          transition: 'opacity 0.8s ease',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
