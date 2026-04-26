import { ActionKind } from '../game/state';
import { Draggable } from './Draggable';
import { PixelItem } from './PixelItem';

type Props = {
  onAction: (kind: ActionKind) => void;
};

type PixelKind = 'coke' | 'jager' | 'joint' | 'sunflower';

const BUTTONS: {
  kind: ActionKind;
  pixelKind: PixelKind;
  label: string;
  imgSrc: string;
  bg: string;
}[] = [
  { kind: 'coke',  pixelKind: 'coke',      label: 'diet coke', imgSrc: '/art/item-coke.png',      bg: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,200,210,0.55))' },
  { kind: 'water', pixelKind: 'sunflower', label: 'sunflower', imgSrc: '/art/item-sunflower.png', bg: 'linear-gradient(180deg, rgba(255,235,180,0.55), rgba(255,200,120,0.55))' },
  { kind: 'jager', pixelKind: 'jager',     label: 'jäger',     imgSrc: '/art/item-jager.png',     bg: 'linear-gradient(180deg, rgba(180,210,170,0.55), rgba(120,170,110,0.55))' },
  { kind: 'weed',  pixelKind: 'joint',     label: 'joint',     imgSrc: '/art/item-joint.png',     bg: 'linear-gradient(180deg, rgba(220,240,200,0.55), rgba(170,210,150,0.55))' },
];

export const ActionTray = ({ onAction }: Props) => {
  const handleDropOn = (kind: ActionKind) => (target: string) => {
    if (target === 'princess' || target === 'garden') {
      // Garden is only valid for sunflower / water; everyone else maps to princess.
      onAction(kind);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 14px)',
        left: 0,
        right: 0,
        padding: '0 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        zIndex: 10,
      }}
    >
      {BUTTONS.map((b) => (
        <Draggable
          key={b.kind}
          ariaLabel={b.label}
          onTap={() => onAction(b.kind)}
          onDropOn={handleDropOn(b.kind)}
        >
          <ButtonBody
            label={b.label}
            pixelKind={b.pixelKind}
            imgSrc={b.imgSrc}
            bg={b.bg}
          />
        </Draggable>
      ))}
    </div>
  );
};

const ButtonBody = ({
  label,
  pixelKind,
  imgSrc,
  bg,
}: {
  label: string;
  pixelKind: PixelKind;
  imgSrc: string;
  bg: string;
}) => (
  <div
    style={{
      width: '100%',
      border: '1px solid rgba(255,255,255,0.65)',
      borderRadius: 22,
      padding: '12px 6px 10px',
      background: bg,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      color: '#3a1a30',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      textShadow: '0 1px 2px rgba(255,255,255,0.5)',
      boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      pointerEvents: 'none',
    }}
  >
    <ItemIcon src={imgSrc} kind={pixelKind} />
    <span>{label}</span>
  </div>
);

const ItemIcon = ({ src, kind }: { src: string; kind: PixelKind }) => {
  // PixelItem renders by default; PNG layers on top if available.
  return (
    <span
      style={{
        position: 'relative',
        width: 40,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PixelItem kind={kind} size={3} />
      <img
        src={src}
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '0';
        }}
        style={{
          position: 'absolute',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      />
    </span>
  );
};
