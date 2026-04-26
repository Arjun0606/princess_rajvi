import { ActionKind } from '../game/state';

type Props = {
  onAction: (kind: ActionKind) => void;
  busy?: boolean;
};

const BUTTONS: {
  kind: ActionKind;
  label: string;
  emojiFallback: string;
  imgSrc: string;
  bg: string;
}[] = [
  { kind: 'coke',  label: 'diet coke', emojiFallback: '🥤', imgSrc: '/art/item-coke.png',  bg: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,200,210,0.55))' },
  { kind: 'water', label: 'sunflower', emojiFallback: '🌻', imgSrc: '/art/item-sunflower.png', bg: 'linear-gradient(180deg, rgba(255,235,180,0.55), rgba(255,200,120,0.55))' },
  { kind: 'jager', label: 'jäger',     emojiFallback: '🍷', imgSrc: '/art/item-jager.png', bg: 'linear-gradient(180deg, rgba(180,210,170,0.55), rgba(120,170,110,0.55))' },
  { kind: 'weed',  label: 'joint',     emojiFallback: '🌿', imgSrc: '/art/item-joint.png',  bg: 'linear-gradient(180deg, rgba(220,240,200,0.55), rgba(170,210,150,0.55))' },
];

export const ActionTray = ({ onAction, busy }: Props) => {
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
        <button
          key={b.kind}
          disabled={busy}
          onClick={() => onAction(b.kind)}
          style={{
            appearance: 'none',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 22,
            padding: '12px 6px 10px',
            background: b.bg,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: '#3a1a30',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            transition: 'transform 0.1s ease',
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)';
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          <ItemIcon src={b.imgSrc} fallback={b.emojiFallback} />
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  );
};

const ItemIcon = ({ src, fallback }: { src: string; fallback: string }) => {
  return (
    <span
      style={{
        position: 'relative',
        width: 38,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={src}
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = '0';
        }}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      />
      <span
        style={{
          position: 'absolute',
          fontSize: 30,
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
          zIndex: -1,
        }}
      >
        {fallback}
      </span>
    </span>
  );
};
