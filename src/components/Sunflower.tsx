import { useMemo } from 'react';
import { Sprite } from './Sprite';

type Props = {
  variant: 0 | 1 | 2;
  growth: number; // 0..1
  giant?: boolean;
  size?: number;
  swayDelay?: number;
};

const PALETTE = {
  Y: '#ffce3c',
  o: '#ff9d2a',
  K: '#3a2010',
  G: '#3aa84a',
  g: '#2c8038',
  S: '#5fa14a',
};

// Three slight variants so the garden doesn't look stamped.
const FULL_VARIANTS: string[][] = [
  // V0
  [
    '..YYY..',
    '.YYoYY.',
    'YYoKoYY',
    'YYoKoYY',
    '.YYoYY.',
    '..YYY..',
    '...G...',
    '...G...',
    '..GGS..',
    '...G...',
    '...G...',
  ],
  // V1 — taller stem
  [
    '..YYY..',
    '.YoYoY.',
    'YYoKoYY',
    'YoKKKoY',
    'YYoKoYY',
    '.YoYoY.',
    '..YYY..',
    '...G...',
    '...G...',
    '..S....',
    '..GG...',
    '...G...',
    '...G...',
    '...G...',
  ],
  // V2 — bigger head
  [
    '.YYYYY.',
    'YYoYoYY',
    'YoKKKoY',
    'YYoKoYY',
    'YoKKKoY',
    'YYoYoYY',
    '.YYYYY.',
    '...G...',
    '...G...',
    '...GS..',
    '...G...',
    '...G...',
  ],
];

const trim = (rows: string[], growth: number): string[] => {
  // 0 = sprout (just stem tip), 1 = full bloom
  const stages = rows.length;
  const visibleFromBottom = Math.max(2, Math.floor(stages * Math.max(0.05, growth)));
  return rows.slice(stages - visibleFromBottom);
};

export const Sunflower = ({ variant, growth, giant, size = 4, swayDelay = 0 }: Props) => {
  const rows = useMemo(() => trim(FULL_VARIANTS[variant]!, growth), [variant, growth]);
  const scale = giant ? 1.6 : 1;
  return (
    <div
      style={{
        display: 'inline-block',
        animation: `sway 3.2s ease-in-out infinite`,
        animationDelay: `${swayDelay}s`,
        transformOrigin: '50% 100%',
        transform: `scale(${scale})`,
      }}
    >
      <Sprite rows={rows} palette={PALETTE} pixel={size} ariaLabel="Sunflower" />
    </div>
  );
};
