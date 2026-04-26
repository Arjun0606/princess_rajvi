import { CSSProperties, memo } from 'react';

type Props = {
  rows: string[];
  palette: Record<string, string>;
  pixel?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
};

// Renders a pixel-art sprite from a row/column character grid. Each non-space
// character maps to a colour in `palette` and becomes a rect in the SVG.
const SpriteImpl = ({
  rows,
  palette,
  pixel = 1,
  className,
  style,
  ariaLabel,
}: Props) => {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const cells: { x: number; y: number; fill: string; key: string }[] = [];

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]!;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]!;
      if (ch === ' ' || ch === '.') continue;
      const fill = palette[ch];
      if (!fill) continue;
      cells.push({ x, y, fill, key: `${x}-${y}` });
    }
  }

  return (
    <svg
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      className={className}
      style={style}
      viewBox={`0 0 ${w} ${h}`}
      width={w * pixel}
      height={h * pixel}
      shapeRendering="crispEdges"
    >
      {cells.map((c) => (
        <rect key={c.key} x={c.x} y={c.y} width={1.02} height={1.02} fill={c.fill} />
      ))}
    </svg>
  );
};

export const Sprite = memo(SpriteImpl);
