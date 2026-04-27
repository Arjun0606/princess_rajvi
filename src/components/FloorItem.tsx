import { PixelItem } from './PixelItem';

type Kind = 'coke' | 'jager' | 'joint' | 'sunflower';

type Props = {
  kind: Kind;
  x: number; // 0..1
  floorVh?: number;
  picked?: boolean;
  onTap?: () => void;
};

// A single dropped item resting on the floor of the scene. Tap it to make
// princess walk over to it. Picks up with a scale-out when picked=true.
export const FloorItem = ({ kind, x, floorVh = 9, picked, onTap }: Props) => (
  <div
    onClick={onTap}
    style={{
      position: 'absolute',
      left: `${x * 100}%`,
      bottom: `${floorVh}vh`,
      transform: `translateX(-50%) scale(${picked ? 0 : 1})`,
      transformOrigin: '50% 100%',
      transition: 'transform 0.35s cubic-bezier(.5,0,1,.5)',
      pointerEvents: picked ? 'none' : 'auto',
      zIndex: 4,
      animation: 'item-drop 0.5s cubic-bezier(.2,.8,.4,1)',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    }}
  >
    <div
      style={{
        width: 36,
        height: 50,
        animation: picked ? undefined : 'item-glint 2.4s ease-in-out infinite',
      }}
    >
      <PixelItem kind={kind} size={3} />
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 28,
        height: 6,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.3)',
        filter: 'blur(2px)',
        zIndex: -1,
      }}
    />
  </div>
);
