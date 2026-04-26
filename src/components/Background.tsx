import { useState } from 'react';
import { phaseFor, SkyPhase } from '../game/time';
import { PixelScene } from './PixelScene';

type Props = {
  date: Date;
};

const PHASE_TO_FILE: Record<SkyPhase, string> = {
  dawn: '/art/bg-dawn.png',
  day: '/art/bg-day.png',
  dusk: '/art/bg-dusk.png',
  night: '/art/bg-night.png',
};

// Renders the procedural pixel-art scene by default. If a real PNG asset
// exists at /art/bg-*.png, it loads on top and replaces the procedural
// fallback once the image is ready.
export const Background = ({ date }: Props) => {
  const phase = phaseFor(date.getHours());
  const [imgReady, setImgReady] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <PixelScene date={date} phase={phase} />

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
          objectPosition: 'center bottom',
          opacity: imgReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </div>
  );
};
