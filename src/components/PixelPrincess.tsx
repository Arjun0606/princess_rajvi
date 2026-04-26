import { CSSProperties, memo } from 'react';
import { Pose } from '../game/state';

type Props = {
  pose: Pose;
  drunk: number;
  high: number;
  className?: string;
  style?: CSSProperties;
};

// 28-wide × 50-tall pixel grid drawn as SVG rects, organised into named
// layers (crown / hair / head / face / dress / accessories). The SVG fills
// its parent container so the App can size her relative to viewport height.
//
// Idle animation: subtle breathing on body, periodic blinks on eyes, gentle
// hair sway. All driven by CSS keyframes scoped to this component.

const PALETTE = {
  outline: '#2a1638',
  crownLight: '#ffe680',
  crownMid: '#e0b73a',
  crownDark: '#a87a18',
  gem: '#ff5d8f',
  gemHi: '#ffb1cc',
  hairDark: '#3a1d0a',
  hairMid: '#5a3318',
  hairHi: '#7a4a26',
  skin: '#ffd9b5',
  skinShade: '#d99c75',
  cheek: '#ffaec0',
  eyeDark: '#2a1a0e',
  eyeWhite: '#ffffff',
  lipsDark: '#a8273e',
  lipsMid: '#d63550',
  collar: '#fff5e9',
  collarShade: '#ddc6b4',
  dressLight: '#ffc4d8',
  dressMid: '#ff7fae',
  dressDark: '#c14a83',
  shoe: '#5b3826',
  petal: '#ffd84d',
  petalDark: '#e58a00',
  centerPx: '#3a2010',
  leaf: '#3aa84a',
  cokeRed: '#d2202a',
  cokeSilver: '#dde4ec',
  cokeShade: '#9aa3ad',
  jagerGreen: '#1f4d23',
  jagerHi: '#356a3d',
  jagerLabel: '#ff8c1a',
  jagerCap: '#dde4ec',
  jointPaper: '#fff5dd',
  jointEmber: '#ff7a18',
  smoke: '#dcdcdc',
};

type PoseFeatures = {
  eyes: 'open' | 'closed' | 'happy' | 'wink' | 'half';
  mouth: 'smile' | 'smirk' | 'open' | 'flat' | 'soft';
  cheeks: boolean;
  pose: 'standing' | 'sitting' | 'sleeping';
  inHand?: 'coke' | 'jager' | 'joint' | 'sunflower';
};

const featuresFor = (pose: Pose): PoseFeatures => {
  switch (pose) {
    case 'coke':      return { eyes: 'happy',  mouth: 'soft',  cheeks: true,  pose: 'standing', inHand: 'coke' };
    case 'jager':     return { eyes: 'wink',   mouth: 'smirk', cheeks: true,  pose: 'standing', inHand: 'jager' };
    case 'joint':     return { eyes: 'half',   mouth: 'soft',  cheeks: true,  pose: 'sitting',  inHand: 'joint' };
    case 'sunflower': return { eyes: 'closed', mouth: 'soft',  cheeks: false, pose: 'standing', inHand: 'sunflower' };
    case 'sleep':     return { eyes: 'closed', mouth: 'flat',  cheeks: false, pose: 'sleeping' };
    default:          return { eyes: 'open',   mouth: 'smile', cheeks: false, pose: 'standing' };
  }
};

const px = (x: number, y: number, fill: string, w = 1, h = 1, key?: string) => (
  <rect key={key ?? `${x}-${y}-${w}-${h}-${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
);

const PixelPrincessImpl = ({ pose, drunk, high, className, style }: Props) => {
  const f = featuresFor(pose);

  const wobbleAmp = Math.min(drunk * 1.2, 4);
  const wobbleDur = drunk >= 2 ? 0.8 : drunk >= 1 ? 1.2 : 1.8;
  const stoned = high > 0.5;

  const animation =
    drunk > 0.3
      ? `pp-wobble ${wobbleDur}s ease-in-out infinite`
      : 'pp-float 4.5s ease-in-out infinite';

  const filter = stoned ? `saturate(${1 + high * 0.18})` : undefined;

  // Sleeping has no idle motion, just gentle Z's.
  const allowIdle = f.pose !== 'sleeping';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        animation,
        filter,
        transformOrigin: '50% 100%',
        ...style,
      }}
    >
      {drunk > 0.3 && (
        <style>{`
          @keyframes pp-wobble {
            0%, 100% { transform: rotate(-${wobbleAmp}deg) translateX(-${wobbleAmp / 3}px); }
            50%      { transform: rotate( ${wobbleAmp}deg) translateX( ${wobbleAmp / 3}px); }
          }
        `}</style>
      )}
      <style>{`
        @keyframes pp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes pp-breathe { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.012); } }
        @keyframes pp-blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97%, 99%      { transform: scaleY(0.05); }
        }
        @keyframes pp-hair-sway {
          0%, 100% { transform: rotate(-0.6deg); }
          50%      { transform: rotate(0.6deg); }
        }
        @keyframes pp-shoulder-shift {
          0%, 100% { transform: translateX(-0.3px) rotate(-0.3deg); }
          50%      { transform: translateX(0.3px)  rotate(0.3deg); }
        }
        @keyframes pp-zzz {
          0%   { opacity: 0; transform: translate(0,0)    scale(0.6); }
          25%  { opacity: 1; }
          100% { opacity: 0; transform: translate(2px,-3px) scale(1.2); }
        }
        .pp-body  { transform-origin: 50% 100%; animation: pp-breathe 4s ease-in-out infinite; }
        .pp-eyes  { transform-origin: 50% 50%;  animation: pp-blink 5.6s linear infinite; }
        .pp-eyes-2 { animation-delay: 1.7s; }
        .pp-hair  { transform-origin: 50% 18%;  animation: pp-hair-sway 6s ease-in-out infinite; }
        .pp-head  { transform-origin: 50% 80%;  animation: pp-shoulder-shift 7s ease-in-out infinite; }
      `}</style>
      <svg
        viewBox="0 0 28 50"
        preserveAspectRatio="xMidYMax meet"
        shapeRendering="crispEdges"
        width="100%"
        height="100%"
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.18))',
        }}
      >
        {/* Ground shadow */}
        <ellipse cx="14" cy="49.5" rx="7" ry="0.5" fill="rgba(0,0,0,0.3)" />

        {f.pose === 'sleeping' ? (
          <SleepingBody />
        ) : (
          <g className={allowIdle ? 'pp-body' : ''}>
            <StandingBody />
            <g className={allowIdle ? 'pp-head' : ''}>
              <g className={allowIdle ? 'pp-hair' : ''}>
                <Hair />
              </g>
              <Head />
              <Crown />
              <SunflowerInHair />
              <Face features={f} />
            </g>
          </g>
        )}

        {f.inHand && f.pose === 'standing' && <ItemInHand kind={f.inHand} />}
        {f.inHand === 'joint' && f.pose === 'sitting' && <ItemInHand kind={f.inHand} sitting />}
        {f.inHand === 'sunflower' && f.pose === 'standing' && <SunflowerHeld />}
      </svg>
    </div>
  );
};

export const PixelPrincess = memo(PixelPrincessImpl);

// --- LAYERS ----------------------------------------------------------------

const StandingBody = () => (
  <g>
    {/* Outline of dress shoulders */}
    {px(8, 17, PALETTE.outline)}
    {px(19, 17, PALETTE.outline)}
    {px(8, 18, PALETTE.outline, 12, 1)}
    {px(7, 19, PALETTE.outline)}
    {px(20, 19, PALETTE.outline)}
    {px(7, 20, PALETTE.outline)}
    {px(20, 20, PALETTE.outline)}
    {/* Collar */}
    {px(9, 18, PALETTE.collar, 10, 1)}
    {px(8, 19, PALETTE.collar, 12, 1)}
    {/* Sleeves */}
    {px(7, 20, PALETTE.dressLight)}
    {px(8, 19, PALETTE.dressLight)}
    {px(8, 20, PALETTE.dressLight)}
    {px(19, 19, PALETTE.dressLight)}
    {px(19, 20, PALETTE.dressLight)}
    {px(20, 20, PALETTE.dressLight)}
    {/* Dress trapezoid */}
    {dressRow(20, 8, 19)}
    {dressRow(21, 8, 20)}
    {dressRow(22, 7, 21)}
    {dressRow(23, 7, 21)}
    {dressRow(24, 6, 22)}
    {dressRow(25, 6, 22)}
    {dressRow(26, 5, 23)}
    {dressRow(27, 5, 23)}
    {dressRow(28, 4, 24)}
    {dressRow(29, 4, 24)}
    {dressRow(30, 3, 25)}
    {dressRow(31, 3, 25)}
    {dressRow(32, 3, 25)}
    {/* White belt */}
    {px(9, 23, PALETTE.collar, 10, 1)}
    {px(10, 24, PALETTE.collarShade, 8, 1)}
    {/* Hem */}
    {px(3, 32, PALETTE.dressDark, 23, 1)}
    {px(3, 33, PALETTE.outline, 23, 1)}
    {/* Legs */}
    {px(11, 33, PALETTE.skin, 2, 2)}
    {px(15, 33, PALETTE.skin, 2, 2)}
    {px(11, 35, PALETTE.skinShade, 2, 1)}
    {px(15, 35, PALETTE.skinShade, 2, 1)}
    {/* Shoes */}
    {px(10, 36, PALETTE.shoe, 4, 2)}
    {px(14, 36, PALETTE.shoe, 4, 2)}
    {px(10, 38, PALETTE.outline, 4, 1)}
    {px(14, 38, PALETTE.outline, 4, 1)}
  </g>
);

const dressRow = (y: number, xStart: number, xEnd: number) => {
  const cells: React.ReactNode[] = [];
  cells.push(px(xStart, y, PALETTE.outline, 1, 1, `dr-l-${y}`));
  cells.push(px(xEnd, y, PALETTE.outline, 1, 1, `dr-r-${y}`));
  cells.push(px(xStart + 1, y, PALETTE.dressDark, 1, 1, `dr-ls-${y}`));
  cells.push(px(xEnd - 1, y, PALETTE.dressDark, 1, 1, `dr-rs-${y}`));
  cells.push(px(xStart + 2, y, PALETTE.dressMid, xEnd - xStart - 3, 1, `dr-mid-${y}`));
  const hi = xStart + 4;
  cells.push(px(hi, y, PALETTE.dressLight, 1, 1, `dr-hi-${y}`));
  return cells;
};

const SleepingBody = () => (
  <g>
    {/* Cushion */}
    {px(4, 38, PALETTE.outline, 20, 1)}
    {px(4, 39, PALETTE.dressLight, 20, 1)}
    {px(4, 40, PALETTE.dressMid, 20, 1)}
    {px(4, 41, PALETTE.dressDark, 20, 1)}
    {px(4, 42, PALETTE.outline, 20, 1)}
    {/* Curled body silhouette */}
    {px(7, 30, PALETTE.outline, 16, 1)}
    {px(6, 31, PALETTE.outline, 18, 1)}
    {px(6, 32, PALETTE.dressLight, 18, 1)}
    {px(5, 33, PALETTE.outline)}
    {px(6, 33, PALETTE.dressMid, 17, 1)}
    {px(23, 33, PALETTE.outline)}
    {px(5, 34, PALETTE.outline)}
    {px(6, 34, PALETTE.dressMid, 17, 1)}
    {px(23, 34, PALETTE.outline)}
    {px(5, 35, PALETTE.outline)}
    {px(6, 35, PALETTE.dressDark, 17, 1)}
    {px(23, 35, PALETTE.outline)}
    {px(5, 36, PALETTE.outline)}
    {px(6, 36, PALETTE.dressDark, 17, 1)}
    {px(23, 36, PALETTE.outline)}
    {px(4, 37, PALETTE.outline, 20, 1)}
    <g transform="translate(2, -2)">
      <SleepingHead />
    </g>
    {/* Z's animation */}
    <g style={{ transformOrigin: '24px 24px' }}>
      <text x="22" y="24" fontSize="3" fill={PALETTE.outline} fontFamily="monospace" fontWeight="bold" style={{ animation: 'pp-zzz 3s ease-in-out infinite' }}>z</text>
      <text x="24" y="20" fontSize="2" fill={PALETTE.outline} fontFamily="monospace" fontWeight="bold" style={{ animation: 'pp-zzz 3s ease-in-out infinite', animationDelay: '0.6s' }}>z</text>
    </g>
  </g>
);

const SleepingHead = () => (
  <g>
    {px(7, 26, PALETTE.hairDark, 10, 1)}
    {px(6, 27, PALETTE.hairDark, 12, 1)}
    {px(6, 28, PALETTE.hairMid, 12, 1)}
    {px(7, 29, PALETTE.hairMid, 10, 1)}
    {px(8, 27, PALETTE.skin, 8, 1)}
    {px(7, 28, PALETTE.skin, 9, 1)}
    {px(8, 29, PALETTE.skin, 7, 1)}
    {px(11, 28, PALETTE.outline, 2, 1)}
    {px(13, 28, PALETTE.cheek)}
    {px(9, 26, PALETTE.crownMid, 6, 1)}
    {px(11, 25, PALETTE.crownLight, 2, 1)}
    {px(7, 26, PALETTE.outline)}
    {px(16, 26, PALETTE.outline)}
    {px(6, 27, PALETTE.outline)}
    {px(17, 27, PALETTE.outline)}
    {px(7, 29, PALETTE.outline)}
    {px(16, 29, PALETTE.outline)}
  </g>
);

const Head = () => (
  <g>
    {/* Outline */}
    {px(7, 5, PALETTE.outline, 14, 1)}
    {px(7, 6, PALETTE.outline)}
    {px(20, 6, PALETTE.outline)}
    {px(6, 7, PALETTE.outline)}
    {px(21, 7, PALETTE.outline)}
    {px(6, 8, PALETTE.outline)}
    {px(21, 8, PALETTE.outline)}
    {px(6, 9, PALETTE.outline)}
    {px(21, 9, PALETTE.outline)}
    {px(6, 10, PALETTE.outline)}
    {px(21, 10, PALETTE.outline)}
    {px(7, 11, PALETTE.outline)}
    {px(20, 11, PALETTE.outline)}
    {px(7, 12, PALETTE.outline)}
    {px(20, 12, PALETTE.outline)}
    {px(8, 13, PALETTE.outline)}
    {px(19, 13, PALETTE.outline)}
    {px(9, 14, PALETTE.outline)}
    {px(18, 14, PALETTE.outline)}
    {px(10, 15, PALETTE.outline, 8, 1)}
    {/* Skin fill */}
    {px(8, 6, PALETTE.skin, 12, 1)}
    {px(7, 7, PALETTE.skin, 14, 1)}
    {px(7, 8, PALETTE.skin, 14, 1)}
    {px(7, 9, PALETTE.skin, 14, 1)}
    {px(7, 10, PALETTE.skin, 14, 1)}
    {px(8, 11, PALETTE.skin, 12, 1)}
    {px(8, 12, PALETTE.skin, 12, 1)}
    {px(9, 13, PALETTE.skin, 10, 1)}
    {px(10, 14, PALETTE.skin, 8, 1)}
    {/* Skin shadow */}
    {px(19, 7, PALETTE.skinShade, 1, 4)}
    {px(18, 11, PALETTE.skinShade)}
    {px(18, 12, PALETTE.skinShade)}
    {/* Neck */}
    {px(11, 15, PALETTE.skin, 6, 1)}
    {px(11, 16, PALETTE.skin, 6, 1)}
    {px(12, 17, PALETTE.skinShade, 4, 1)}
    {px(11, 16, PALETTE.outline)}
    {px(16, 16, PALETTE.outline)}
  </g>
);

const Hair = () => (
  <g>
    {/* Long hair down sides */}
    {px(5, 11, PALETTE.hairDark)}
    {px(5, 12, PALETTE.hairDark)}
    {px(22, 11, PALETTE.hairDark)}
    {px(22, 12, PALETTE.hairDark)}
    {px(4, 13, PALETTE.hairDark)}
    {px(5, 13, PALETTE.hairDark)}
    {px(22, 13, PALETTE.hairDark)}
    {px(23, 13, PALETTE.hairDark)}
    {px(4, 14, PALETTE.hairMid)}
    {px(5, 14, PALETTE.hairMid)}
    {px(22, 14, PALETTE.hairMid)}
    {px(23, 14, PALETTE.hairMid)}
    {px(4, 15, PALETTE.hairMid)}
    {px(23, 15, PALETTE.hairMid)}
    {px(4, 16, PALETTE.hairMid)}
    {px(23, 16, PALETTE.hairMid)}
    {px(4, 17, PALETTE.hairMid)}
    {px(23, 17, PALETTE.hairMid)}
    {px(4, 18, PALETTE.hairDark)}
    {px(23, 18, PALETTE.hairDark)}
    {/* Hair top */}
    {px(8, 5, PALETTE.hairDark, 12, 1)}
    {px(7, 6, PALETTE.hairDark)}
    {px(20, 6, PALETTE.hairDark)}
    {/* Bangs */}
    {px(8, 6, PALETTE.hairDark, 4, 1)}
    {px(16, 6, PALETTE.hairDark, 4, 1)}
    {px(8, 7, PALETTE.hairMid, 2, 1)}
    {px(18, 7, PALETTE.hairMid, 2, 1)}
    {/* Side hair */}
    {px(6, 7, PALETTE.hairDark)}
    {px(21, 7, PALETTE.hairDark)}
    {px(6, 8, PALETTE.hairDark)}
    {px(21, 8, PALETTE.hairDark)}
    {px(6, 9, PALETTE.hairDark)}
    {px(21, 9, PALETTE.hairDark)}
    {px(6, 10, PALETTE.hairMid)}
    {px(21, 10, PALETTE.hairMid)}
    {/* Highlight strands */}
    {px(11, 6, PALETTE.hairHi)}
    {px(15, 6, PALETTE.hairHi)}
  </g>
);

const Crown = () => (
  <g>
    {/* Three points + band */}
    {px(9, 2, PALETTE.outline)}
    {px(9, 3, PALETTE.crownLight)}
    {px(9, 4, PALETTE.crownLight)}
    {px(8, 4, PALETTE.outline)}
    {px(10, 4, PALETTE.crownMid)}
    {px(13, 1, PALETTE.outline)}
    {px(14, 1, PALETTE.outline)}
    {px(13, 2, PALETTE.crownLight)}
    {px(14, 2, PALETTE.crownLight)}
    {px(13, 3, PALETTE.crownLight)}
    {px(14, 3, PALETTE.crownLight)}
    {px(13, 4, PALETTE.crownMid)}
    {px(14, 4, PALETTE.crownMid)}
    {px(18, 2, PALETTE.outline)}
    {px(18, 3, PALETTE.crownLight)}
    {px(18, 4, PALETTE.crownLight)}
    {px(17, 4, PALETTE.crownMid)}
    {px(19, 4, PALETTE.outline)}
    {px(8, 5, PALETTE.outline)}
    {px(19, 5, PALETTE.outline)}
    {px(9, 5, PALETTE.crownMid, 10, 1)}
    {px(8, 4, PALETTE.crownMid)}
    {px(11, 4, PALETTE.crownMid)}
    {px(12, 4, PALETTE.crownMid)}
    {px(15, 4, PALETTE.crownMid)}
    {px(16, 4, PALETTE.crownMid)}
    {px(13, 4, PALETTE.gem)}
    {px(14, 4, PALETTE.gem)}
    {px(13, 3, PALETTE.gemHi)}
    {px(10, 5, PALETTE.crownLight)}
  </g>
);

const SunflowerInHair = () => (
  <g>
    {px(2, 9, PALETTE.outline)}
    {px(3, 8, PALETTE.outline)}
    {px(4, 9, PALETTE.outline)}
    {px(2, 10, PALETTE.petalDark)}
    {px(3, 9, PALETTE.petal)}
    {px(4, 10, PALETTE.petalDark)}
    {px(2, 11, PALETTE.outline)}
    {px(3, 10, PALETTE.centerPx)}
    {px(3, 11, PALETTE.outline)}
    {px(4, 11, PALETTE.outline)}
    {px(2, 9, PALETTE.petal)}
    {px(4, 9, PALETTE.petal)}
    {px(3, 11, PALETTE.petal)}
  </g>
);

const Face = ({ features }: { features: PoseFeatures }) => (
  <g>
    <g className="pp-eyes">
      <Eyes kind={features.eyes} />
    </g>
    <Mouth kind={features.mouth} />
    {features.cheeks && <Cheeks />}
  </g>
);

const Eyes = ({ kind }: { kind: PoseFeatures['eyes'] }) => {
  switch (kind) {
    case 'open':
      return (
        <g>
          {px(10, 9, PALETTE.eyeDark)}
          {px(10, 10, PALETTE.eyeDark)}
          {px(11, 9, PALETTE.eyeWhite)}
          {px(11, 10, PALETTE.eyeDark)}
          {px(16, 9, PALETTE.eyeWhite)}
          {px(16, 10, PALETTE.eyeDark)}
          {px(17, 9, PALETTE.eyeDark)}
          {px(17, 10, PALETTE.eyeDark)}
        </g>
      );
    case 'closed':
    case 'happy':
      return (
        <g>
          {px(10, 10, PALETTE.eyeDark, 2, 1)}
          {px(16, 10, PALETTE.eyeDark, 2, 1)}
          {px(11, 9, PALETTE.eyeDark)}
          {px(17, 9, PALETTE.eyeDark)}
        </g>
      );
    case 'wink':
      return (
        <g>
          {px(10, 9, PALETTE.eyeDark)}
          {px(10, 10, PALETTE.eyeDark)}
          {px(11, 9, PALETTE.eyeWhite)}
          {px(11, 10, PALETTE.eyeDark)}
          {px(16, 10, PALETTE.eyeDark, 2, 1)}
          {px(17, 9, PALETTE.eyeDark)}
        </g>
      );
    case 'half':
      return (
        <g>
          {px(10, 10, PALETTE.eyeDark, 2, 1)}
          {px(16, 10, PALETTE.eyeDark, 2, 1)}
          {px(10, 9, PALETTE.skinShade, 2, 1)}
          {px(16, 9, PALETTE.skinShade, 2, 1)}
        </g>
      );
  }
};

const Mouth = ({ kind }: { kind: PoseFeatures['mouth'] }) => {
  switch (kind) {
    case 'smile':
      return (
        <g>
          {px(12, 13, PALETTE.lipsDark)}
          {px(13, 13, PALETTE.lipsMid, 2, 1)}
          {px(15, 13, PALETTE.lipsDark)}
          {px(13, 14, PALETTE.lipsDark, 2, 1)}
        </g>
      );
    case 'smirk':
      return (
        <g>
          {px(15, 13, PALETTE.lipsDark)}
          {px(14, 13, PALETTE.lipsMid)}
          {px(15, 14, PALETTE.lipsMid)}
        </g>
      );
    case 'open':
      return (
        <g>
          {px(13, 13, PALETTE.lipsDark, 2, 1)}
          {px(13, 14, PALETTE.lipsDark, 2, 1)}
        </g>
      );
    case 'soft':
      return (
        <g>
          {px(12, 14, PALETTE.lipsDark)}
          {px(13, 14, PALETTE.lipsMid, 2, 1)}
          {px(15, 14, PALETTE.lipsDark)}
        </g>
      );
    case 'flat':
    default:
      return px(12, 14, PALETTE.lipsDark, 4, 1);
  }
};

const Cheeks = () => (
  <g>
    {px(8, 11, PALETTE.cheek)}
    {px(9, 11, PALETTE.cheek)}
    {px(18, 11, PALETTE.cheek)}
    {px(19, 11, PALETTE.cheek)}
  </g>
);

const ItemInHand = ({ kind, sitting }: { kind: PoseFeatures['inHand']; sitting?: boolean }) => {
  if (!kind || kind === 'sunflower') return null; // sunflower drawn separately
  const dy = sitting ? 6 : 0;
  const x = sitting ? 14 : 4;
  const y = 18 + dy;

  if (kind === 'coke') {
    return (
      <g>
        {px(x, y, PALETTE.outline)}
        {px(x + 1, y, PALETTE.cokeSilver)}
        {px(x + 2, y, PALETTE.outline)}
        {px(x, y + 1, PALETTE.outline)}
        {px(x + 1, y + 1, PALETTE.cokeRed)}
        {px(x + 2, y + 1, PALETTE.outline)}
        {px(x, y + 2, PALETTE.outline)}
        {px(x + 1, y + 2, PALETTE.cokeRed)}
        {px(x + 2, y + 2, PALETTE.outline)}
        {px(x, y + 3, PALETTE.outline)}
        {px(x + 1, y + 3, PALETTE.cokeSilver)}
        {px(x + 2, y + 3, PALETTE.outline)}
        {px(x, y + 4, PALETTE.outline, 3, 1)}
      </g>
    );
  }
  if (kind === 'jager') {
    return (
      <g>
        {px(x + 1, y - 1, PALETTE.jagerCap)}
        {px(x, y, PALETTE.outline)}
        {px(x + 1, y, PALETTE.jagerGreen)}
        {px(x + 2, y, PALETTE.outline)}
        {px(x, y + 1, PALETTE.outline)}
        {px(x + 1, y + 1, PALETTE.jagerGreen)}
        {px(x + 2, y + 1, PALETTE.outline)}
        {px(x, y + 2, PALETTE.outline)}
        {px(x + 1, y + 2, PALETTE.jagerLabel)}
        {px(x + 2, y + 2, PALETTE.outline)}
        {px(x, y + 3, PALETTE.outline)}
        {px(x + 1, y + 3, PALETTE.jagerLabel)}
        {px(x + 2, y + 3, PALETTE.outline)}
        {px(x, y + 4, PALETTE.outline, 3, 1)}
      </g>
    );
  }
  if (kind === 'joint') {
    return (
      <g>
        {px(x, y + 2, PALETTE.outline, 5, 1)}
        {px(x, y + 3, PALETTE.jointPaper, 4, 1)}
        {px(x + 4, y + 3, PALETTE.jointEmber)}
        {px(x, y + 4, PALETTE.outline, 5, 1)}
        {/* smoke */}
        <g style={{ animation: 'pp-float 2s ease-in-out infinite' }}>
          {px(x + 5, y + 1, PALETTE.smoke)}
          {px(x + 6, y, PALETTE.smoke)}
        </g>
      </g>
    );
  }
  return null;
};

// Sunflower held up in front of face, larger than the in-hand items.
const SunflowerHeld = () => (
  <g>
    {px(11, 7, PALETTE.outline, 6, 1)}
    {px(10, 8, PALETTE.outline)}
    {px(11, 8, PALETTE.petal, 6, 1)}
    {px(17, 8, PALETTE.outline)}
    {px(10, 9, PALETTE.outline)}
    {px(11, 9, PALETTE.petal)}
    {px(12, 9, PALETTE.centerPx, 4, 1)}
    {px(16, 9, PALETTE.petal)}
    {px(17, 9, PALETTE.outline)}
    {px(10, 10, PALETTE.outline)}
    {px(11, 10, PALETTE.petal, 6, 1)}
    {px(17, 10, PALETTE.outline)}
    {px(11, 11, PALETTE.outline, 6, 1)}
    {px(13, 12, PALETTE.leaf, 2, 4)}
  </g>
);
