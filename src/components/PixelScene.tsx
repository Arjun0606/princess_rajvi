import { useMemo } from 'react';
import { SkyPhase, skyGradient, sunPosition, moonPosition, moonPhase } from '../game/time';

type Props = {
  date: Date;
  phase: SkyPhase;
};

// Procedural pixel-art balcony scene rendered entirely in SVG so we don't
// need any external image assets. The whole scene composes layers from far
// to near: sky gradient → distant mountains → sunflower meadow → balustrade →
// marble terrace floor → side table + planter (drawn elsewhere).
//
// Color palettes shift with time of day so the scene feels alive across the
// rhythm of the day.

const PALETTES: Record<SkyPhase, {
  mountainsFar: string;
  mountainsNear: string;
  meadowDark: string;
  meadowMid: string;
  meadowLight: string;
  petal: string;
  petalDark: string;
  center: string;
  stem: string;
  marbleLight: string;
  marbleMid: string;
  marbleDark: string;
  marbleVein: string;
  balustrade: string;
  balustradeDark: string;
  balustradeShade: string;
  vine: string;
  rose: string;
  roseDark: string;
  ambient: string;
}> = {
  dawn: {
    mountainsFar:  '#e8b4cd',
    mountainsNear: '#c08aa8',
    meadowDark:    '#9a7a4a',
    meadowMid:     '#c79e58',
    meadowLight:   '#e6c074',
    petal:         '#ffd866',
    petalDark:     '#e09a30',
    center:        '#4a2810',
    stem:          '#6b8e3a',
    marbleLight:   '#fee5d8',
    marbleMid:     '#f4c8c8',
    marbleDark:    '#d99fac',
    marbleVein:    '#c47588',
    balustrade:    '#fcd7df',
    balustradeDark:'#d68fa0',
    balustradeShade:'#a76478',
    vine:          '#5a7a3a',
    rose:          '#ff6b91',
    roseDark:      '#c83864',
    ambient:       'rgba(255,180,160,0.15)',
  },
  day: {
    mountainsFar:  '#8aa9c8',
    mountainsNear: '#6f87a8',
    meadowDark:    '#3d6b2a',
    meadowMid:     '#5a8e3c',
    meadowLight:   '#7eb050',
    petal:         '#ffd84d',
    petalDark:     '#e58a00',
    center:        '#3a2010',
    stem:          '#3a8a3a',
    marbleLight:   '#fff5f0',
    marbleMid:     '#ffd6dc',
    marbleDark:    '#e8a8b8',
    marbleVein:    '#cb7e94',
    balustrade:    '#ffe2ea',
    balustradeDark:'#dfa1b3',
    balustradeShade:'#a76478',
    vine:          '#3c8d3c',
    rose:          '#ff5d8f',
    roseDark:      '#b83464',
    ambient:       'rgba(255,255,200,0.12)',
  },
  dusk: {
    mountainsFar:  '#9d6a8b',
    mountainsNear: '#6f3a5e',
    meadowDark:    '#7d5028',
    meadowMid:     '#a87035',
    meadowLight:   '#d99848',
    petal:         '#ffb44a',
    petalDark:     '#c66a18',
    center:        '#4a2010',
    stem:          '#5a6a2a',
    marbleLight:   '#ffd8c8',
    marbleMid:     '#f5b5b5',
    marbleDark:    '#c47898',
    marbleVein:    '#9c4a6a',
    balustrade:    '#f8c0c8',
    balustradeDark:'#b8758a',
    balustradeShade:'#7a3a52',
    vine:          '#4a5a2a',
    rose:          '#ff5a78',
    roseDark:      '#9c2a4c',
    ambient:       'rgba(255,140,120,0.18)',
  },
  night: {
    mountainsFar:  '#3a3260',
    mountainsNear: '#241e44',
    meadowDark:    '#1c1f3a',
    meadowMid:     '#2c344e',
    meadowLight:   '#3e4c6a',
    petal:         '#a89858',
    petalDark:     '#6a583a',
    center:        '#1a0e08',
    stem:          '#2a4a3a',
    marbleLight:   '#5a4a78',
    marbleMid:     '#3c2e5a',
    marbleDark:    '#241844',
    marbleVein:    '#3a2858',
    balustrade:    '#5e4878',
    balustradeDark:'#3a2854',
    balustradeShade:'#1c1238',
    vine:          '#1c3a28',
    rose:          '#a8385a',
    roseDark:      '#5a1828',
    ambient:       'rgba(80, 60, 160, 0.25)',
  },
};

export const PixelScene = ({ date, phase }: Props) => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const gradient = useMemo(() => skyGradient(hour, minute), [hour, minute]);
  const sun = sunPosition(hour, minute);
  const moon = moonPosition(hour, minute);
  const phaseFraction = useMemo(() => moonPhase(date), [date.getDate()]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = PALETTES[phase];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sky gradient base */}
      <div style={{ position: 'absolute', inset: 0, background: gradient }} />

      {/* Pixel sun */}
      {sun >= 0 && <PixelSun x={sun} />}
      {/* Pixel moon */}
      {moon >= 0 && <PixelMoon x={moon} phase={phaseFraction} />}
      {/* Pixel stars */}
      {(phase === 'night' || phase === 'dawn') && <PixelStars />}
      {/* Distant mountains */}
      <Mountains palette={p} />
      {/* Pixel sunflower meadow rows */}
      <MeadowRows palette={p} />
      {/* Marble terrace floor + balustrade + side table + planter */}
      <BalconyForeground palette={p} />
      {/* Soft warm overlay light */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: p.ambient,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

const PixelSun = ({ x }: { x: number }) => {
  const cy = 22 + Math.sin(x * Math.PI) * -10; // arcs higher across the day
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${cy}%`,
        width: 80,
        height: 80,
        transform: 'translate(-50%, -50%)',
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 0 18px #ffd84d80)',
      }}
    >
      <g shapeRendering="crispEdges">
        <rect x="42" y="38" width="16" height="24" fill="#ffd84d" />
        <rect x="38" y="42" width="24" height="16" fill="#ffd84d" />
        <rect x="40" y="40" width="20" height="20" fill="#ffe680" />
        <rect x="44" y="44" width="12" height="12" fill="#fff5c2" />
      </g>
    </svg>
  );
};

const PixelMoon = ({ x, phase }: { x: number; phase: number }) => {
  const cy = 22 + Math.sin(x * Math.PI) * -10;
  const lit = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${cy}%`,
        width: 60,
        height: 60,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 20px rgba(255,245,214,0.45)',
      }}
    >
      <svg viewBox="0 0 16 16" width="60" height="60" shapeRendering="crispEdges">
        <rect x="4" y="2" width="8" height="12" fill="#fff5d6" />
        <rect x="2" y="4" width="12" height="8" fill="#fff5d6" />
        <rect x="3" y="3" width="10" height="10" fill="#fff5d6" />
        {/* phase shadow */}
        {lit < 0.95 && (
          <>
            <rect
              x={Math.round((1 - lit) * 12) - 2}
              y="2"
              width="8"
              height="12"
              fill="#1a1340"
            />
            <rect
              x={Math.round((1 - lit) * 12) - 4}
              y="4"
              width="12"
              height="8"
              fill="#1a1340"
            />
          </>
        )}
      </svg>
    </div>
  );
};

const STAR_POSITIONS = Array.from({ length: 38 }, (_, i) => ({
  x: (i * 97 + 13) % 100,
  y: ((i * 53) % 50),
  size: (i % 3) + 1,
  delay: (i * 0.27) % 5,
}));

const PixelStars = () => (
  <>
    {STAR_POSITIONS.map((s, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          background: '#fff',
          opacity: 0.85,
          animation: 'shimmer 3s ease-in-out infinite',
          animationDelay: `${s.delay}s`,
        }}
      />
    ))}
  </>
);

const Mountains = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <svg
    viewBox="0 0 100 30"
    preserveAspectRatio="none"
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '38%',
      width: '100%',
      height: '20%',
    }}
  >
    {/* Far mountains — silhouette */}
    <polygon
      points="0,30 0,18 8,10 14,16 22,6 30,14 40,8 48,16 56,4 64,12 72,8 82,16 90,6 100,12 100,30"
      fill={palette.mountainsFar}
      shapeRendering="crispEdges"
    />
    {/* Near mountains */}
    <polygon
      points="0,30 0,22 6,18 12,22 20,14 28,20 36,16 44,22 52,14 60,20 68,16 78,22 86,18 94,22 100,18 100,30"
      fill={palette.mountainsNear}
      shapeRendering="crispEdges"
    />
  </svg>
);

const MeadowRows = ({ palette }: { palette: typeof PALETTES['day'] }) => {
  // 5 meadow rows from far to near. Each is a horizontal band with little
  // sunflower silhouettes scattered along it; closer rows have larger flowers.
  const rows = [
    { y: 64, scale: 0.5, count: 16, color: palette.meadowDark },
    { y: 70, scale: 0.65, count: 14, color: palette.meadowMid },
    { y: 76, scale: 0.85, count: 12, color: palette.meadowMid },
    { y: 82, scale: 1.05, count: 10, color: palette.meadowLight },
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {rows.map((r, i) => (
        <g key={i} shapeRendering="crispEdges">
          {/* Soft ground band */}
          <rect x="0" y={r.y - 2} width="100" height="6" fill={r.color} opacity="0.55" />
          {/* Tiny sunflowers along the band */}
          {Array.from({ length: r.count }).map((_, k) => {
            const xPct = (k / (r.count - 1)) * 100 + ((i + k) % 3 - 1) * 1.3;
            const s = r.scale;
            const cx = xPct;
            const cy = r.y - 2.5;
            return (
              <g key={k}>
                <rect x={cx - 0.5 * s} y={cy - 1.5 * s} width={1 * s} height={3 * s} fill={palette.stem} />
                <rect x={cx - 1.2 * s} y={cy - 3 * s} width={2.4 * s} height={1.4 * s} fill={palette.petal} />
                <rect x={cx - 0.5 * s} y={cy - 2.6 * s} width={1 * s} height={0.8 * s} fill={palette.center} />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

const BalconyForeground = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <>
    {/* Marble floor */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '32%',
        background: `linear-gradient(180deg, ${palette.marbleMid} 0%, ${palette.marbleDark} 100%)`,
      }}
    />
    {/* Marble veining */}
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '32%',
        opacity: 0.3,
      }}
    >
      <g stroke={palette.marbleVein} strokeWidth="0.4" fill="none" shapeRendering="crispEdges">
        <path d="M5 10 Q 18 14 28 8 T 60 12 T 95 8" />
        <path d="M2 22 Q 20 18 35 24 T 70 18 T 100 22" />
        <path d="M10 5 Q 22 8 30 4 T 50 6 T 80 2" />
      </g>
    </svg>
    {/* Marble tile lines */}
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '32%',
        opacity: 0.18,
      }}
    >
      <g stroke={palette.marbleVein} strokeWidth="0.3" shapeRendering="crispEdges">
        <line x1="0" y1="14" x2="100" y2="10" />
        <line x1="0" y1="22" x2="100" y2="20" />
        <line x1="33" y1="10" x2="20" y2="32" />
        <line x1="66" y1="10" x2="80" y2="32" />
      </g>
    </svg>

    {/* Balustrade — capstone band + carved columns + railing top */}
    <Balustrade palette={palette} />

    {/* Side table on the right edge */}
    <SideTable palette={palette} />

    {/* Sunflower planter on the left edge */}
    <Planter palette={palette} />

    {/* Pink rose vine on the right wall */}
    <RoseVine palette={palette} />
  </>
);

const Balustrade = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '32%',
      height: 64,
      pointerEvents: 'none',
    }}
  >
    {/* Top capstone */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 56,
        height: 8,
        background: `linear-gradient(180deg, ${palette.balustrade} 0%, ${palette.balustradeDark} 100%)`,
        boxShadow: `0 1px 0 ${palette.balustradeShade}`,
      }}
    />
    {/* Bottom rail */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 6,
        background: `linear-gradient(180deg, ${palette.balustrade} 0%, ${palette.balustradeDark} 100%)`,
      }}
    />
    {/* Carved columns */}
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 6, width: '100%', height: 50 }}
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 2 + i * 7;
        return (
          <g key={i} shapeRendering="crispEdges">
            {/* Column shape: hourglass-ish baluster */}
            <rect x={x - 1} y="0"  width="4" height="6" fill={palette.balustrade} />
            <rect x={x - 0.5} y="6"  width="3" height="6" fill={palette.balustrade} />
            <rect x={x + 0.5} y="12" width="1" height="8" fill={palette.balustradeDark} />
            <rect x={x - 0.5} y="20" width="3" height="6" fill={palette.balustrade} />
            <rect x={x - 1.2} y="26" width="4.5" height="14" fill={palette.balustrade} />
            <rect x={x - 1.2} y="40" width="4.5" height="6" fill={palette.balustradeDark} />
            {/* shadow side */}
            <rect x={x + 1.5} y="0"  width="0.7" height="46" fill={palette.balustradeShade} opacity="0.5" />
          </g>
        );
      })}
    </svg>
  </div>
);

const SideTable = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <div
    style={{
      position: 'absolute',
      right: 18,
      bottom: 18,
      width: 92,
      height: 58,
      zIndex: 4,
      pointerEvents: 'none',
    }}
  >
    {/* Table top */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 14,
        background: `linear-gradient(180deg, ${palette.marbleLight} 0%, ${palette.marbleMid} 100%)`,
        borderRadius: '50% / 100% 100% 0 0',
        boxShadow: `0 4px 0 ${palette.marbleVein}`,
      }}
    />
    {/* Center column */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 14,
        transform: 'translateX(-50%)',
        width: 16,
        height: 36,
        background: `linear-gradient(180deg, ${palette.marbleMid} 0%, ${palette.marbleDark} 100%)`,
      }}
    />
    {/* Carved foot */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: 36,
        height: 10,
        background: palette.marbleDark,
        clipPath: 'polygon(0 100%, 8% 0, 92% 0, 100% 100%)',
      }}
    />
  </div>
);

const Planter = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <div
    style={{
      position: 'absolute',
      left: 8,
      bottom: 14,
      width: 76,
      height: 88,
      zIndex: 4,
      pointerEvents: 'none',
    }}
  >
    {/* Sunflower bunch above planter */}
    <svg viewBox="0 0 30 40" width="76" height="56" style={{ display: 'block' }} shapeRendering="crispEdges">
      {/* Stems */}
      <rect x="14" y="18" width="2" height="20" fill={palette.stem} />
      <rect x="9"  y="22" width="2" height="16" fill={palette.stem} />
      <rect x="19" y="20" width="2" height="18" fill={palette.stem} />
      {/* Leaves */}
      <rect x="6"  y="28" width="4" height="2" fill={palette.stem} />
      <rect x="20" y="26" width="4" height="2" fill={palette.stem} />
      {/* Flower 1 — center */}
      <rect x="11" y="13" width="8" height="8" fill={palette.petal} />
      <rect x="9"  y="15" width="12" height="4" fill={palette.petal} />
      <rect x="13" y="15" width="4" height="4" fill={palette.center} />
      {/* Flower 2 — left */}
      <rect x="6"  y="17" width="6" height="6" fill={palette.petalDark} />
      <rect x="4"  y="19" width="10" height="2" fill={palette.petalDark} />
      <rect x="8"  y="19" width="2" height="2" fill={palette.center} />
      {/* Flower 3 — right */}
      <rect x="17" y="15" width="6" height="6" fill={palette.petal} />
      <rect x="15" y="17" width="10" height="2" fill={palette.petal} />
      <rect x="19" y="17" width="2" height="2" fill={palette.center} />
    </svg>
    {/* Planter pot */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: 60,
        height: 32,
        background: `linear-gradient(180deg, ${palette.balustrade} 0%, ${palette.balustradeDark} 100%)`,
        clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)',
        boxShadow: `inset 0 4px 0 ${palette.marbleLight}`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: 60,
        height: 6,
        background: palette.balustradeShade,
      }}
    />
  </div>
);

const RoseVine = ({ palette }: { palette: typeof PALETTES['day'] }) => (
  <div
    style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 70,
      pointerEvents: 'none',
    }}
  >
    {/* Castle wall hint */}
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: '32%',
        width: 30,
        background: `linear-gradient(90deg, ${palette.balustrade}00 0%, ${palette.balustrade} 60%, ${palette.balustradeDark} 100%)`,
      }}
    />
    {/* Vine drawing */}
    <svg
      viewBox="0 0 70 200"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Vine path */}
      <path
        d="M40 0 Q 50 30 32 60 Q 16 90 38 120 Q 56 150 30 190"
        stroke={palette.vine}
        strokeWidth="3"
        fill="none"
        shapeRendering="crispEdges"
      />
      {/* Leaves */}
      <g fill={palette.vine} shapeRendering="crispEdges">
        <rect x="46" y="22" width="6" height="3" />
        <rect x="22" y="48" width="5" height="3" />
        <rect x="42" y="78" width="6" height="3" />
        <rect x="20" y="108" width="5" height="3" />
        <rect x="48" y="138" width="6" height="3" />
        <rect x="22" y="168" width="5" height="3" />
      </g>
      {/* Roses */}
      <g shapeRendering="crispEdges">
        {[
          { x: 38, y: 18 },
          { x: 28, y: 50 },
          { x: 36, y: 82 },
          { x: 24, y: 112 },
          { x: 40, y: 142 },
          { x: 28, y: 172 },
        ].map((r, i) => (
          <g key={i}>
            <rect x={r.x - 3} y={r.y - 3} width="6" height="6" fill={palette.rose} />
            <rect x={r.x - 1} y={r.y - 1} width="2" height="2" fill={palette.roseDark} />
            <rect x={r.x - 4} y={r.y - 1} width="1" height="2" fill={palette.roseDark} />
            <rect x={r.x + 3} y={r.y - 1} width="1" height="2" fill={palette.roseDark} />
          </g>
        ))}
      </g>
    </svg>
  </div>
);
