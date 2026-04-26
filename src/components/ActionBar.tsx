import { ActionKind } from '../game/state';

type Props = {
  onAction: (kind: ActionKind) => void;
  busy?: boolean;
};

const BUTTONS: { kind: ActionKind; label: string; emoji: string; bg: string }[] = [
  { kind: 'coke',  label: 'diet coke', emoji: '🥤', bg: 'linear-gradient(135deg,#e8e8ef,#c0c0d0)' },
  { kind: 'water', label: 'sunflower', emoji: '🌻', bg: 'linear-gradient(135deg,#ffe066,#ffb84d)' },
  { kind: 'jager', label: 'jäger',     emoji: '🍷', bg: 'linear-gradient(135deg,#3a6b2f,#1f3d1a)' },
  { kind: 'weed',  label: 'joint',     emoji: '🌿', bg: 'linear-gradient(135deg,#9bd87a,#3aa84a)' },
];

export const ActionBar = ({ onAction, busy }: Props) => (
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
          border: '2px solid rgba(255,255,255,0.35)',
          borderRadius: 18,
          padding: '12px 6px 10px',
          background: b.bg,
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
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
        <span style={{ fontSize: 24, lineHeight: 1 }}>{b.emoji}</span>
        <span>{b.label}</span>
      </button>
    ))}
  </div>
);
