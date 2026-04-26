import { GameState } from '../game/state';

type Props = {
  stats: GameState['stats'];
};

const BARS: { key: keyof GameState['stats']; label: string; emoji: string; color: string }[] = [
  { key: 'sass',  label: 'sass',  emoji: '👑', color: '#ff5d8f' },
  { key: 'joy',   label: 'joy',   emoji: '🌻', color: '#ffce3c' },
  { key: 'vibes', label: 'vibes', emoji: '🍷', color: '#5fa14a' },
  { key: 'chill', label: 'chill', emoji: '🌿', color: '#9d6bff' },
];

export const Stats = ({ stats }: Props) => (
  <div
    style={{
      position: 'absolute',
      top: 'env(safe-area-inset-top, 0)',
      left: 0,
      right: 0,
      padding: '14px 16px 8px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      pointerEvents: 'none',
      zIndex: 10,
    }}
  >
    {BARS.map((b) => {
      const v = Math.round(stats[b.key]);
      const low = v < 25;
      return (
        <div
          key={b.key}
          style={{
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 14,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            animation: low ? 'shimmer 1.4s ease-in-out infinite' : undefined,
          }}
        >
          <span style={{ fontSize: 16 }}>{b.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ opacity: 0.9 }}>{b.label}</span>
              <span style={{ opacity: 0.7 }}>{v}</span>
            </div>
            <div
              style={{
                height: 5,
                background: 'rgba(255,255,255,0.18)',
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
