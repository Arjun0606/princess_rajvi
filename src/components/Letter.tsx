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
      style={{
        width: '100%',
        maxWidth: 380,
        position: 'relative',
        animation: 'letter-in 0.55s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      {/* Parchment image (transparent if asset isn't there yet) */}
      <img
        src="/art/ui-letter.png"
        alt=""
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.5))',
        }}
      />
      {/* Fallback parchment background drawn in CSS */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, #fff5e2 0%, #ffe1bf 100%)',
          borderRadius: 14,
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '12% 10% 14% 10%',
          color: '#3a1a1a',
          fontFamily: 'Georgia, "New York", serif',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            opacity: 0.55,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          from her royal highness
        </div>
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {text}
        </div>
        <div style={{ fontStyle: 'italic', textAlign: 'right', fontSize: 14 }}>
          — princess rajvi 🌻
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '12px 0',
            background: '#ff5d8f',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 93, 143, 0.5)',
          }}
        >
          i'm sorry princess
        </button>
      </div>
    </div>
  </div>
);
