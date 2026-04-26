// Hand-coded SVG pixel sprites for the 4 inventory items. These render by
// default when no /art/item-*.png asset is present.

type Kind = 'coke' | 'jager' | 'joint' | 'sunflower';

type Props = {
  kind: Kind;
  size?: number;
  className?: string;
};

const PALETTE = {
  outline:    '#1a1023',
  cokeRed:    '#d2202a',
  cokeRedHi:  '#ff4451',
  cokeSilver: '#dde4ec',
  cokeSilverHi:'#ffffff',
  cokeShade:  '#9aa3ad',
  jagerGreen: '#1f4d23',
  jagerGreenHi:'#356a3d',
  jagerOrange:'#ff8c1a',
  jagerOrangeHi:'#ffb84a',
  jagerCap:   '#dde4ec',
  jagerStag:  '#5b3826',
  jointPaper: '#fff5dd',
  jointPaperShade:'#d8c89a',
  jointEmber: '#ff7a18',
  jointEmberHi:'#ffd84d',
  smoke:      '#dcdcdc',
  petal:      '#ffd84d',
  petalHi:    '#ffe680',
  petalDark:  '#e58a00',
  center:     '#3a2010',
  centerHi:   '#5b3826',
  stem:       '#3a8a3a',
  stemHi:     '#5fa14a',
  leaf:       '#3aa84a',
};

const px = (x: number, y: number, fill: string, w = 1, h = 1, key?: string) => (
  <rect key={key ?? `${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
);

export const PixelItem = ({ kind, size = 8, className }: Props) => {
  const w = 16;
  const h = 20;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * size}
      height={h * size}
      shapeRendering="crispEdges"
      className={className}
      style={{
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))',
      }}
    >
      {kind === 'coke' && <CokeCan />}
      {kind === 'jager' && <JagerBottle />}
      {kind === 'joint' && <Joint />}
      {kind === 'sunflower' && <Sunflower />}
    </svg>
  );
};

const CokeCan = () => (
  <g>
    {/* Top — pull tab silhouette */}
    {px(6, 1, PALETTE.outline, 4, 1)}
    {px(5, 2, PALETTE.outline)}
    {px(10, 2, PALETTE.outline)}
    {px(6, 2, PALETTE.cokeSilver, 4, 1)}
    {px(7, 1, PALETTE.cokeSilverHi, 2, 1)}
    {/* Top rim */}
    {px(4, 3, PALETTE.outline, 8, 1)}
    {/* Body — silver */}
    {px(4, 4, PALETTE.outline)}
    {px(11, 4, PALETTE.outline)}
    {px(5, 4, PALETTE.cokeSilver, 6, 1)}
    {px(5, 5, PALETTE.cokeSilverHi)}
    {/* Red stripe */}
    {px(4, 6, PALETTE.outline, 8, 1)}
    {px(4, 7, PALETTE.outline)}
    {px(11, 7, PALETTE.outline)}
    {px(5, 7, PALETTE.cokeRed, 6, 1)}
    {px(5, 7, PALETTE.cokeRedHi)}
    {px(4, 8, PALETTE.outline)}
    {px(11, 8, PALETTE.outline)}
    {px(5, 8, PALETTE.cokeRed, 6, 1)}
    {/* Wordmark hint — a lighter pixel */}
    {px(7, 8, PALETTE.cokeSilverHi, 2, 1)}
    {px(4, 9, PALETTE.outline, 8, 1)}
    {/* Body silver lower */}
    {px(4, 10, PALETTE.outline)}
    {px(11, 10, PALETTE.outline)}
    {px(5, 10, PALETTE.cokeSilver, 6, 1)}
    {px(4, 11, PALETTE.outline)}
    {px(11, 11, PALETTE.outline)}
    {px(5, 11, PALETTE.cokeSilver, 6, 1)}
    {px(5, 11, PALETTE.cokeSilverHi)}
    {px(4, 12, PALETTE.outline)}
    {px(11, 12, PALETTE.outline)}
    {px(5, 12, PALETTE.cokeSilver, 6, 1)}
    {px(4, 13, PALETTE.outline)}
    {px(11, 13, PALETTE.outline)}
    {px(5, 13, PALETTE.cokeShade, 6, 1)}
    {/* Bottom rim */}
    {px(4, 14, PALETTE.outline, 8, 1)}
    {px(5, 15, PALETTE.outline, 6, 1)}
  </g>
);

const JagerBottle = () => (
  <g>
    {/* Cap */}
    {px(7, 0, PALETTE.outline, 2, 1)}
    {px(6, 1, PALETTE.outline)}
    {px(9, 1, PALETTE.outline)}
    {px(7, 1, PALETTE.jagerCap, 2, 1)}
    {px(6, 2, PALETTE.outline, 4, 1)}
    {/* Neck */}
    {px(7, 3, PALETTE.outline)}
    {px(8, 3, PALETTE.outline)}
    {px(7, 3, PALETTE.jagerGreen, 2, 1)}
    {px(7, 4, PALETTE.outline)}
    {px(8, 4, PALETTE.outline)}
    {px(7, 4, PALETTE.jagerGreen, 2, 1)}
    {/* Shoulders */}
    {px(6, 5, PALETTE.outline, 4, 1)}
    {/* Body — green with orange label */}
    {px(5, 6, PALETTE.outline)}
    {px(10, 6, PALETTE.outline)}
    {px(6, 6, PALETTE.jagerGreen, 4, 1)}
    {px(6, 6, PALETTE.jagerGreenHi)}
    {px(5, 7, PALETTE.outline)}
    {px(10, 7, PALETTE.outline)}
    {px(6, 7, PALETTE.jagerGreen, 4, 1)}
    {/* Orange label */}
    {px(5, 8, PALETTE.outline)}
    {px(10, 8, PALETTE.outline)}
    {px(6, 8, PALETTE.jagerOrange, 4, 1)}
    {px(6, 8, PALETTE.jagerOrangeHi)}
    {px(5, 9, PALETTE.outline)}
    {px(10, 9, PALETTE.outline)}
    {px(6, 9, PALETTE.jagerOrange, 4, 1)}
    {/* Stag silhouette on label — tiny */}
    {px(7, 9, PALETTE.jagerStag, 2, 1)}
    {px(5, 10, PALETTE.outline)}
    {px(10, 10, PALETTE.outline)}
    {px(6, 10, PALETTE.jagerOrange, 4, 1)}
    {/* JÄGER text suggestion (just dark pixels) */}
    {px(7, 11, PALETTE.outline, 2, 1)}
    {px(5, 11, PALETTE.outline)}
    {px(10, 11, PALETTE.outline)}
    {px(6, 11, PALETTE.jagerOrange)}
    {px(9, 11, PALETTE.jagerOrange)}
    {px(5, 12, PALETTE.outline, 6, 1)}
    {/* Body green again below label */}
    {px(5, 13, PALETTE.outline)}
    {px(10, 13, PALETTE.outline)}
    {px(6, 13, PALETTE.jagerGreen, 4, 1)}
    {px(5, 14, PALETTE.outline)}
    {px(10, 14, PALETTE.outline)}
    {px(6, 14, PALETTE.jagerGreen, 4, 1)}
    {px(5, 15, PALETTE.outline)}
    {px(10, 15, PALETTE.outline)}
    {px(6, 15, PALETTE.jagerGreen, 4, 1)}
    {px(5, 16, PALETTE.outline, 6, 1)}
  </g>
);

const Joint = () => (
  <g>
    {/* Smoke wisps above */}
    {px(11, 1, PALETTE.smoke)}
    {px(12, 2, PALETTE.smoke)}
    {px(11, 3, PALETTE.smoke)}
    {px(13, 4, PALETTE.smoke)}
    {px(12, 5, PALETTE.smoke)}
    {/* Joint horizontal across center */}
    {px(2, 9, PALETTE.outline, 11, 1)}
    {px(2, 10, PALETTE.outline)}
    {px(13, 10, PALETTE.outline)}
    {/* paper — twisted at left, lit at right */}
    {px(3, 10, PALETTE.jointPaper, 9, 1)}
    {px(3, 10, PALETTE.jointPaperShade)}
    {px(11, 10, PALETTE.jointEmber)}
    {px(12, 10, PALETTE.jointEmberHi)}
    {px(2, 11, PALETTE.outline, 11, 1)}
    {/* twisted left tip */}
    {px(2, 9, PALETTE.outline)}
    {px(2, 11, PALETTE.outline)}
    {px(2, 10, PALETTE.outline)}
    {px(1, 9, PALETTE.outline)}
    {px(1, 10, PALETTE.jointPaperShade)}
    {px(1, 11, PALETTE.outline)}
  </g>
);

const Sunflower = () => (
  <g>
    {/* Petals — outer ring */}
    {px(7, 2, PALETTE.outline)}
    {px(8, 2, PALETTE.outline)}
    {px(7, 3, PALETTE.petalHi)}
    {px(8, 3, PALETTE.petalHi)}
    {px(5, 3, PALETTE.outline)}
    {px(6, 3, PALETTE.petal)}
    {px(9, 3, PALETTE.petal)}
    {px(10, 3, PALETTE.outline)}
    {px(4, 4, PALETTE.outline)}
    {px(5, 4, PALETTE.petal)}
    {px(6, 4, PALETTE.petalHi)}
    {px(7, 4, PALETTE.petalHi, 2, 1)}
    {px(9, 4, PALETTE.petalHi)}
    {px(10, 4, PALETTE.petal)}
    {px(11, 4, PALETTE.outline)}
    {px(3, 5, PALETTE.outline)}
    {px(4, 5, PALETTE.petal)}
    {px(5, 5, PALETTE.petal)}
    {px(6, 5, PALETTE.center)}
    {px(7, 5, PALETTE.centerHi, 2, 1)}
    {px(9, 5, PALETTE.center)}
    {px(10, 5, PALETTE.petal)}
    {px(11, 5, PALETTE.petal)}
    {px(12, 5, PALETTE.outline)}
    {px(3, 6, PALETTE.outline)}
    {px(4, 6, PALETTE.petal)}
    {px(5, 6, PALETTE.center)}
    {px(6, 6, PALETTE.center, 4, 1)}
    {px(10, 6, PALETTE.center)}
    {px(11, 6, PALETTE.petal)}
    {px(12, 6, PALETTE.outline)}
    {px(3, 7, PALETTE.outline)}
    {px(4, 7, PALETTE.petal)}
    {px(5, 7, PALETTE.center)}
    {px(6, 7, PALETTE.centerHi)}
    {px(7, 7, PALETTE.center, 2, 1)}
    {px(9, 7, PALETTE.centerHi)}
    {px(10, 7, PALETTE.center)}
    {px(11, 7, PALETTE.petal)}
    {px(12, 7, PALETTE.outline)}
    {px(4, 8, PALETTE.outline)}
    {px(5, 8, PALETTE.petal)}
    {px(6, 8, PALETTE.center, 4, 1)}
    {px(10, 8, PALETTE.petal)}
    {px(11, 8, PALETTE.outline)}
    {px(5, 9, PALETTE.outline)}
    {px(6, 9, PALETTE.petal)}
    {px(7, 9, PALETTE.petalHi, 2, 1)}
    {px(9, 9, PALETTE.petal)}
    {px(10, 9, PALETTE.outline)}
    {px(6, 10, PALETTE.outline)}
    {px(7, 10, PALETTE.petal, 2, 1)}
    {px(9, 10, PALETTE.outline)}
    {px(7, 11, PALETTE.outline, 2, 1)}
    {/* Stem */}
    {px(7, 11, PALETTE.outline)}
    {px(8, 11, PALETTE.outline)}
    {px(7, 12, PALETTE.outline)}
    {px(8, 12, PALETTE.stem)}
    {px(7, 13, PALETTE.stem)}
    {px(8, 13, PALETTE.stemHi)}
    {px(7, 14, PALETTE.stem)}
    {px(8, 14, PALETTE.stem)}
    {/* Leaf */}
    {px(9, 13, PALETTE.outline)}
    {px(10, 13, PALETTE.leaf)}
    {px(9, 14, PALETTE.leaf)}
    {px(10, 14, PALETTE.outline)}
    {/* lower stem */}
    {px(7, 15, PALETTE.stem)}
    {px(8, 15, PALETTE.stem)}
    {px(7, 16, PALETTE.outline, 2, 1)}
  </g>
);
