type Props = {
  text: string;
  onClose: () => void;
};

export const Letter = ({ text, onClose }: Props) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(40, 20, 50, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
      zIndex: 60,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="stardew-box"
      style={{
        width: '100%',
        maxWidth: 380,
        padding: '22px 22px 18px',
        animation: 'letter-in 0.55s cubic-bezier(.2,.7,.2,1)',
        fontFamily: 'var(--pixel-font)',
      }}
    >
      <div
        style={{
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--stardew-text-soft)',
          marginBottom: 8,
        }}
      >
        ✦ from her royal highness ✦
      </div>
      <div
        style={{
          fontSize: 19,
          lineHeight: 1.3,
          whiteSpace: 'pre-wrap',
          color: 'var(--stardew-text)',
          letterSpacing: 0.3,
          marginBottom: 14,
        }}
      >
        {text}
      </div>
      <div
        style={{
          fontSize: 16,
          textAlign: 'right',
          color: 'var(--stardew-text-soft)',
          marginBottom: 16,
          letterSpacing: 0.5,
        }}
      >
        — princess rajvi 🌻
      </div>
      <button
        onClick={onClose}
        className="stardew-button"
        style={{
          width: '100%',
          padding: '10px 0 12px',
          fontSize: 18,
          letterSpacing: 0.5,
          cursor: 'pointer',
        }}
      >
        i'm sorry princess
      </button>
    </div>
  </div>
);
