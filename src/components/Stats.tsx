import { GameState } from '../game/state';

type Props = {
  stats: GameState['stats'];
};

const BARS: { key: keyof GameState['stats']; label: string; emoji: string; color: string }[] = [
  { key: 'sass',  label: 'sass',  emoji: '👑', color: '#ff5d8f' },
  { key: 'joy',   label: 'joy',   emoji: '🌻', color: '#ffce3c' },
  { key: 'vibes', label: 'vibes', emoji: '🍷', color: '#a8d978' },
  { key: 'chill', label: 'chill', emoji: '🌿', color: '#c4a5ff' },
];

export const Stats = ({ stats }: Props) => (
  <div
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      left: 14,
      right: 86,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      zIndex: 10,
      pointerEvents: 'none',
    }}
  >
    {BARS.map((b) => {
      const v = Math.round(stats[b.key]);
      const low = v < 25;
      return (
        <div
          key={b.key}
          style={{
            background: 'rgba(255, 245, 232, 0.55)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 14,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#3a1a30',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            border: '1px solid rgba(255,255,255,0.5)',
            animation: low ? 'shimmer 1.4s ease-in-out infinite' : undefined,
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
          }}
        >
          <span style={{ fontSize: 14 }}>{b.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span>{b.label}</span>
              <span style={{ opacity: 0.65 }}>{v}</span>
            </div>
            <div
              style={{
                height: 4,
                background: 'rgba(58,26,48,0.15)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${v}%`,
                  background: b.color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
