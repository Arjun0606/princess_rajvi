import { CSSProperties, useMemo } from 'react';
import { Sprite } from './Sprite';
import { Mood } from '../game/state';

type Props = {
  mood: Mood;
  drunk: number;
  high: number;
  sleeping: boolean;
  size?: number;
  onTap?: () => void;
};

// Princess Rajvi — pink dress, gold crown w/ pink gem, long brown hair.
// Mouth + eyes swap by mood.
//
// Palette:
//  Y gold  G gem  B hair  H hair-shade  S skin  s skin-shade
//  P dress  p dress-hi  W white  E eye  C lips  L shoe

const PALETTE = {
  Y: '#ffd84d',
  G: '#ff5d8f',
  B: '#3d220f',
  H: '#5a3318',
  S: '#ffd9b5',
  s: '#e8b890',
  P: '#ff8ab3',
  p: '#ffc4d8',
  W: '#ffffff',
  E: '#2a1a0e',
  C: '#ff4d77',
  L: '#5b3826',
  k: '#000000',
};

const baseRows = (eyes: string[], mouth: string[]): string[] => {
  // 18 wide × 26 tall grid.
  // Build the head, then splice in eye + mouth rows so we can swap them.
  return [
    '......YY..YY......',
    '.....YYYYYYYY.....',
    '....YYYGYYYGYYY...',
    '...BBBBBBBBBBBB...',
    '..BBHHHHHHHHHBB...',
    '.BBHSSSSSSSSSHBB..',
    '.BHSSSSSSSSSSSHB..',
    eyes[0]!,
    eyes[1]!,
    '.BHSSSSSSSSSSSHB..',
    mouth[0]!,
    '.BHSSSSSSSSSSSHB..',
    '..BHSSSSSSSSHB....',
    '...HHSSSSSSHH.....',
    '....SSSSSSSSS.....',
    '...PPPPPPPPPPP....',
    '..PPpPPPPPPpPPP...',
    '.PPpPPPPPPPPpPP...',
    'PPPPPPPPWWPPPPPP..',
    'PPPPPPPWWWWPPPPP..',
    'PPpPPPPPPPPPpPPP..',
    'PPPPPPPPPPPPPPPP..',
    '.PPPPPPPPPPPPPP...',
    '..PPPPPPPPPPPP....',
    '....SS......SS....',
    '...LLL......LLL...',
  ];
};

const eyesOpen = [
  '.BHSSSEWESSEWESHB.', // upper lash row
  '.BHSSSEWESSEWESHB.',
];

const eyesHappy = [
  '.BHSSSEEESSEEESHB.',
  '.BHSSSSSSSSSSSHB..',
];

const eyesClosed = [
  '.BHSSSEEESSEEESHB.',
  '.BHSSSSSSSSSSSHB..',
];

const eyesDrunk = [
  '.BHSSSEEESSEEESHB.',
  '.BHSSSWESSSSWESHB.',
];

const eyesStoned = [
  '.BHSSSEWESSEWESHB.',
  '.BHSSSCCCSSCCCSHB.', // pink under-eye haze
];

const mouthSmile = ['..BHSSSSCCCCSSSHB.'];
const mouthSmirk = ['..BHSSSSCCSSSSSHB.'];
const mouthOpen = ['..BHSSSSCCCCCSSHB.'];
const mouthFlat = ['..BHSSSSSCCCSSSHB.'];

const moodToFace = (mood: Mood, sleeping: boolean) => {
  if (sleeping) return { eyes: eyesClosed, mouth: mouthFlat };
  switch (mood) {
    case 'thriving':
      return { eyes: eyesHappy, mouth: mouthSmile };
    case 'drunk':
      return { eyes: eyesDrunk, mouth: mouthOpen };
    case 'stoned':
      return { eyes: eyesStoned, mouth: mouthSmirk };
    case 'sassy':
      return { eyes: eyesOpen, mouth: mouthSmirk };
    case 'needy':
      return { eyes: eyesOpen, mouth: mouthFlat };
    case 'sleepy':
      return { eyes: eyesClosed, mouth: mouthFlat };
    default:
      return { eyes: eyesOpen, mouth: mouthSmile };
  }
};

export const Princess = ({ mood, drunk, high, sleeping, size = 6, onTap }: Props) => {
  const rows = useMemo(() => {
    const { eyes, mouth } = moodToFace(mood, sleeping);
    return baseRows(eyes, mouth);
  }, [mood, sleeping]);

  // Drunk = sway. The more she's had, the heavier the wobble.
  // Stoned = whole-sprite gentle float + brightness shimmer.
  const wobbleAmp = Math.min(drunk * 1.5, 6);
  const wobbleDur = drunk >= 2 ? 0.7 : drunk >= 1 ? 1.1 : 1.6;
  const stonedShimmer = high > 0.5;

  const style: CSSProperties = {
    animation: drunk > 0.3
      ? `wobble ${wobbleDur}s ease-in-out infinite`
      : stonedShimmer
        ? 'float 3s ease-in-out infinite, shimmer 4s ease-in-out infinite'
        : 'float 4s ease-in-out infinite',
    transformOrigin: '50% 100%',
    // Map drunk amplitude into custom keyframes by overriding rotate range via CSS variables.
    // Keep CSS-only for now — small abuse of the inline style to pump amplitude:
    transform: drunk > 0.3 ? undefined : undefined,
    filter: stonedShimmer ? 'saturate(1.2)' : undefined,
    cursor: 'pointer',
    pointerEvents: 'auto',
  };

  // Inject dynamic keyframes for the actual wobble amplitude using a unique id.
  const customWobble = drunk > 0.3 ? (
    <style>{`
      @keyframes wobble-live {
        0%, 100% { transform: rotate(-${wobbleAmp}deg) translateX(-${wobbleAmp / 3}px); }
        50%      { transform: rotate( ${wobbleAmp}deg) translateX(${wobbleAmp / 3}px); }
      }
      .princess-live { animation: wobble-live ${wobbleDur}s ease-in-out infinite !important; }
    `}</style>
  ) : null;

  return (
    <div
      onClick={onTap}
      onTouchEnd={(e) => {
        e.preventDefault();
        onTap?.();
      }}
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      className={drunk > 0.3 ? 'princess-live' : ''}
    >
      {customWobble}
      <Sprite
        rows={rows}
        palette={PALETTE}
        pixel={size}
        ariaLabel="Princess Rajvi"
        style={style}
      />
      {sleeping && <SleepZ />}
    </div>
  );
};

const SleepZ = () => (
  <div
    style={{
      position: 'absolute',
      top: -10,
      right: -16,
      fontWeight: 700,
      fontSize: 18,
      color: 'white',
      textShadow: '0 2px 4px rgba(0,0,0,0.4)',
      animation: 'zzz 2.4s ease-in-out infinite',
    }}
  >
    z
  </div>
);
