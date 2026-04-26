type Props = {
  text: string;
  onClose: () => void;
};

export const Letter = ({ text, onClose }: Props) => (
  <div
    onClick={onClose}
    style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      zIndex: 30,
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        background:
          'linear-gradient(180deg, #fff8eb 0%, #ffe9c2 100%)',
        borderRadius: 14,
        padding: '24px 22px',
        color: '#3a1a1a',
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        animation: 'letter-in 0.45s cubic-bezier(.2,.7,.2,1)',
        fontFamily: '"Georgia", serif',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 6, letterSpacing: 1 }}>
        FROM HER ROYAL HIGHNESS
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</div>
      <div style={{ marginTop: 14, fontSize: 14, fontStyle: 'italic', textAlign: 'right' }}>
        — princess rajvi 🌻
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: 18,
          width: '100%',
          padding: '12px 0',
          background: '#ff5d8f',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        i'm sorry princess
      </button>
    </div>
  </div>
);
