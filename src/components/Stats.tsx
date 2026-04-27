import { GameState } from '../game/state';

type Props = {
  stats: GameState['stats'];
};

const BARS: { key: keyof GameState['stats']; label: string; emoji: string; color: string; shade: string }[] = [
  { key: 'sass',  label: 'sass',  emoji: '👑', color: '#ff5d8f', shade: '#a82954' },
  { key: 'joy',   label: 'joy',   emoji: '🌻', color: '#ffce3c', shade: '#a87a18' },
  { key: 'vibes', label: 'vibes', emoji: '🍷', color: '#a8d978', shade: '#5a8a3a' },
  { key: 'chill', label: 'chill', emoji: '🌿', color: '#c4a5ff', shade: '#7a5acc' },
];

export const Stats = ({ stats }: Props) => (
  <div
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 14px)',
      left: 12,
      right: 88,
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
          className="stardew-box"
          style={{
            borderRadius: 4,
            padding: '4px 8px 5px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            animation: low ? 'shimmer 1.4s ease-in-out infinite' : undefined,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{b.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 14,
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              <span>{b.label}</span>
              <span style={{ opacity: 0.6 }}>{v}</span>
            </div>
            {/* chunky pixel bar */}
            <div
              style={{
                height: 6,
                background: '#3a1d0a',
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${v}%`,
                  background: `linear-gradient(180deg, ${b.color} 0%, ${b.shade} 100%)`,
                  transition: 'width 0.4s ease',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
