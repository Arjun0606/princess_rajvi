import { useMemo } from 'react';
import { phaseFor, SkyPhase, skyGradient } from '../game/time';

type Props = {
  date: Date;
};

// Crossfades between four time-of-day backgrounds. Falls back to a CSS sky
// gradient + ambient props so the scene still looks alive before the
// generated artwork is dropped into /public/art/.

const PHASE_TO_FILE: Record<SkyPhase, string> = {
  dawn: '/art/bg-dawn.png',
  day: '/art/bg-day.png',
  dusk: '/art/bg-dusk.png',
  night: '/art/bg-night.png',
};

export const Background = ({ date }: Props) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const phase = phaseFor(hour);
  const gradient = useMemo(() => skyGradient(hour, minute), [hour, minute]);
  const isNight = phase === 'night' || phase === 'dawn';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* CSS gradient fallback always under the image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: gradient,
        }}
      />

      {/* Generated background image — fades in once it loads */}
      <img
        key={phase}
        src={PHASE_TO_FILE[phase]}
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center bottom',
          animation: 'fadeIn 0.8s ease',
        }}
      />

      {isNight && <Stars />}
      <PlaceholderProps phase={phase} />
    </div>
  );
};

const STAR_COUNT = 36;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: (i * 97 + 13) % 100,
  y: ((i * 53) % 50),
  size: (i % 3) + 1,
  delay: (i * 0.27) % 5,
}));

const Stars = () => (
  <>
    {STARS.map((s, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          background: '#fff',
          borderRadius: '50%',
          opacity: 0.7,
          animation: 'shimmer 3s ease-in-out infinite',
          animationDelay: `${s.delay}s`,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);

// Soft painterly props rendered in CSS so the scene reads even before the
// generated artwork lands. Pink balustrade, warm ground glow, sunflower
// silhouette field.
const PlaceholderProps = ({ phase }: { phase: SkyPhase }) => {
  const horizonGlow =
    phase === 'dawn' ? 'rgba(255, 182, 159, 0.6)' :
    phase === 'day'  ? 'rgba(255, 220, 160, 0.4)' :
    phase === 'dusk' ? 'rgba(255, 130, 110, 0.55)' :
                       'rgba(120, 90, 200, 0.35)';
  return (
    <>
      {/* horizon glow */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: '32%',
          height: '22%',
          background: `radial-gradient(ellipse at 50% 100%, ${horizonGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      {/* meadow horizon line — silhouette of distant sunflowers */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: '28%',
          height: 60,
          background: 'linear-gradient(180deg, rgba(99, 60, 80, 0.2) 0%, rgba(60, 30, 50, 0.5) 100%)',
          maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* terrace floor */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: '32%',
          background: phase === 'night'
            ? 'linear-gradient(180deg, rgba(80, 50, 70, 0.7) 0%, rgba(40, 20, 40, 1) 100%)'
            : 'linear-gradient(180deg, rgba(255, 220, 230, 0.6) 0%, rgba(220, 160, 180, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* balustrade silhouette */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: '32%',
          height: 12,
          background: phase === 'night' ? 'rgba(60, 30, 60, 0.8)' : 'rgba(200, 130, 160, 0.85)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

/* fade keyframe injected via inline css below */
const FADE_STYLE = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
`;
const styleEl = document.createElement('style');
styleEl.textContent = FADE_STYLE;
if (typeof document !== 'undefined' && !document.getElementById('bg-fade-style')) {
  styleEl.id = 'bg-fade-style';
  document.head.appendChild(styleEl);
}
