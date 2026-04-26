import { Sunflower as SunflowerData } from '../game/state';
import { Sunflower } from './Sunflower';

type Props = {
  flowers: SunflowerData[];
  now: number;
};

const GROWTH_DURATION_MS = 1000 * 60 * 60 * 8; // 8h to fully bloom

export const Garden = ({ flowers, now }: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
        pointerEvents: 'none',
      }}
    >
      {flowers.map((f) => {
        const age = now - f.plantedAt;
        const growth = Math.min(1, age / GROWTH_DURATION_MS);
        const sway = ((f.x * 13) % 1) * 1.6;
        return (
          <div
            key={f.id}
            style={{
              position: 'absolute',
              left: `${f.x * 100}%`,
              bottom: 4,
              transform: 'translateX(-50%)',
            }}
          >
            <Sunflower
              variant={f.variant}
              growth={growth}
              giant={f.giant}
              size={4}
              swayDelay={sway}
            />
          </div>
        );
      })}
    </div>
  );
};
