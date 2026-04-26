type Props = {
  name: string;
  plantedAt: number;
  onClose: () => void;
};

const formatAge = (plantedAt: number) => {
  const ms = Date.now() - plantedAt;
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} minutes old`;
  if (hours < 24) return `${Math.round(hours)} hours old`;
  const days = hours / 24;
  if (days < 14) return `${Math.round(days)} days old`;
  return `${Math.round(days / 7)} weeks old`;
};

export const FlowerInfo = ({ name, plantedAt, onClose }: Props) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 35,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 110px)',
      pointerEvents: 'auto',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'rgba(255, 248, 232, 0.95)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        animation: 'pop 0.3s cubic-bezier(.2,.7,.2,1)',
        maxWidth: 'min(80vw, 280px)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>🌻</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: '#3a1a30',
          fontFamily: '"Georgia", serif',
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: 11, color: '#5a2a40', opacity: 0.7, marginTop: 2 }}>
        {formatAge(plantedAt)}
      </div>
    </div>
  </div>
);
