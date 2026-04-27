import { GameState } from '../game/state';

type Props = {
  stats: GameState['stats'];
};

const BARS: { key: keyof GameState['stats']; emoji: string; color: string; shade: string }[] = [
  { key: 'sass',  emoji: '👑', color: '#ff5d8f', shade: '#a82954' },
  { key: 'joy',   emoji: '🌻', color: '#ffce3c', shade: '#a87a18' },
  { key: 'vibes', emoji: '🍷', color: '#a8d978', shade: '#5a8a3a' },
  { key: 'chill', emoji: '🌿', color: '#c4a5ff', shade: '#7a5acc' },
];

// Compact Stardew-style stat strip, jammed into the top-LEFT corner so
// the world below stays uncluttered. Each pip = one stat, with a tiny
// horizontal bar beneath the emoji + numeric value. ~24px tall total.
export const Stats = ({ stats }: Props) => (
  <div
    className="stardew-box"
    style={{
      position: 'absolute',
      top: 'calc(env(safe-area-inset-top, 0) + 10px)',
      left: 12,
      padding: '4px 8px 6px',
      borderRadius: 4,
      display: 'flex',
      gap: 10,
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 28,
            animation: low ? 'shimmer 1.4s ease-in-out infinite' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
            <span style={{ fontSize: 11, lineHeight: 1 }}>{b.emoji}</span>
            <span style={{ fontFamily: 'var(--pixel-font)', color: 'var(--stardew-text)', fontSize: 12 }}>
              {v}
            </span>
          </div>
          <div
            style={{
              marginTop: 2,
              width: 28,
              height: 3,
              background: '#3a1d0a',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${v}%`,
                background: `linear-gradient(180deg, ${b.color} 0%, ${b.shade} 100%)`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);
