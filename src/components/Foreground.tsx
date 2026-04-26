import { ItemOnTable, Sunflower as SunflowerData } from '../game/state';
import { PixelItem } from './PixelItem';

type Props = {
  itemsOnTable: ItemOnTable[];
  flowers: SunflowerData[];
  now: number;
};

const ITEM_FILE: Record<ItemOnTable['kind'], string> = {
  coke: '/art/item-coke.png',
  jager: '/art/item-jager.png',
  joint: '/art/item-joint.png',
  sunflower: '/art/item-sunflower.png',
};

export const Foreground = ({ itemsOnTable, flowers, now }: Props) => {
  return (
    <>
      {/* The side table — items appear here when given */}
      <SideTable items={itemsOnTable} />

      {/* Foreground sunflower garden */}
      <GardenForeground flowers={flowers} now={now} />
    </>
  );
};

const SideTable = ({ items }: { items: ItemOnTable[] }) => (
  <div
    style={{
      position: 'absolute',
      right: 20,
      bottom: 130,
      width: 110,
      height: 70,
      pointerEvents: 'none',
      zIndex: 4,
    }}
  >
    {/* Table surface */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 14,
        background: 'linear-gradient(180deg, #f5d8df 0%, #d99fb0 100%)',
        borderRadius: '50% / 100% 100% 0 0',
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: 8,
        right: 8,
        height: 4,
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
      }}
    />

    {/* Items on the table */}
    {items.map((it, i) => (
      <ItemOnSurface key={it.id} item={it} index={i} total={items.length} />
    ))}
  </div>
);

const ItemOnSurface = ({
  item,
  index,
  total,
}: {
  item: ItemOnTable;
  index: number;
  total: number;
}) => {
  const spread = 90;
  const x = total === 1 ? 50 : 10 + (spread / Math.max(1, total - 1)) * index;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: `${x}%`,
        transform: 'translateX(-50%)',
        width: 36,
        height: 56,
        animation: 'pop 0.4s cubic-bezier(.2,.7,.2,1)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <PixelItem kind={item.kind} size={3} />
      <img
        src={ITEM_FILE[item.kind]}
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '0';
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
        }}
      />
    </div>
  );
};

const GROWTH_DURATION_MS = 1000 * 60 * 60 * 8;

const GardenForeground = ({
  flowers,
  now,
}: {
  flowers: SunflowerData[];
  now: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 110,
      height: 90,
      pointerEvents: 'none',
      zIndex: 5,
    }}
  >
    {flowers.map((f, i) => {
      const age = now - f.plantedAt;
      const growth = Math.min(1, age / GROWTH_DURATION_MS);
      // Distribute deterministically from id hash so positions feel stable.
      const hash = [...f.id].reduce((a, c) => a + c.charCodeAt(0), 0);
      const xPct = (hash % 90) + 5;
      const z = (hash % 3); // depth lane: 0 closest, 2 furthest
      const scale = (0.7 + (2 - z) * 0.18) * (0.4 + growth * 0.6);
      return (
        <FlowerSprite
          key={f.id}
          xPct={xPct}
          z={z}
          scale={scale}
          variant={f.variant}
          delay={i * 0.3}
        />
      );
    })}
  </div>
);

const FLOWER_PALETTES = [
  { petal: '#ffce3c', petalDark: '#ff9d2a', center: '#3a2010' },
  { petal: '#ffd84d', petalDark: '#e58a00', center: '#3a2010' },
  { petal: '#ffd28b', petalDark: '#ee8a45', center: '#3a2010' },
];

const FlowerSprite = ({
  xPct,
  z,
  scale,
  variant,
  delay,
}: {
  xPct: number;
  z: number;
  scale: number;
  variant: 0 | 1 | 2;
  delay: number;
}) => {
  const p = FLOWER_PALETTES[variant];
  const yOffset = z * 18;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct}%`,
        bottom: yOffset,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: '50% 100%',
        animation: 'sway 3.5s ease-in-out infinite',
        animationDelay: `${delay}s`,
        opacity: 0.6 + (2 - z) * 0.2,
      }}
    >
      <svg viewBox="0 0 60 100" width="60" height="100" style={{ overflow: 'visible' }}>
        {/* stem */}
        <rect x="28" y="40" width="4" height="60" fill="#2c8038" rx="2" />
        {/* leaf */}
        <ellipse cx="40" cy="68" rx="9" ry="4" fill="#3aa84a" transform="rotate(-30 40 68)" />
        {/* outer petals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <ellipse
              key={i}
              cx="30"
              cy="30"
              rx="5"
              ry="14"
              fill={p?.petalDark}
              transform={`rotate(${angle} 30 30)`}
            />
          );
        })}
        {/* inner petals */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12 + 15;
          return (
            <ellipse
              key={i}
              cx="30"
              cy="30"
              rx="4"
              ry="10"
              fill={p?.petal}
              transform={`rotate(${angle} 30 30)`}
            />
          );
        })}
        {/* center */}
        <circle cx="30" cy="30" r="6.5" fill={p?.center} />
        <circle cx="30" cy="30" r="6" fill="url(#seedTexture)" />
        <defs>
          <radialGradient id="seedTexture">
            <stop offset="0%" stopColor="#5b3826" />
            <stop offset="100%" stopColor="#2a1a0e" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
