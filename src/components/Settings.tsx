import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  daysTogether: number;
  onClose: () => void;
  onClearChat: () => void;
  onResetWorld: () => void;
};

export const Settings = ({ open, daysTogether, onClose, onClearChat, onResetWorld }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setMounted(true));
    else {
      setMounted(false);
      setConfirmReset(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40,20,50,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 65,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="stardew-box"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '20px 22px calc(env(safe-area-inset-bottom, 0) + 22px)',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(.2,.7,.2,1)',
          fontFamily: 'var(--pixel-font)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--stardew-border-mid)',
            margin: '0 auto 12px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 26, color: 'var(--stardew-text)', letterSpacing: 0.5, lineHeight: 1 }}>
            the kingdom
          </div>
          <button
            onClick={onClose}
            className="stardew-button"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.45)',
            border: '2px solid var(--stardew-border-mid)',
            boxShadow: 'inset 0 0 0 1px var(--stardew-border-light)',
            padding: '10px 12px',
            marginBottom: 12,
            fontSize: 17,
            lineHeight: 1.25,
            color: 'var(--stardew-text)',
            letterSpacing: 0.3,
          }}
        >
          you and princess rajvi have been friends for <strong>day {daysTogether + 1}</strong>. long may you reign.
        </div>

        <Row label="clear chat history" subtitle="leaves the journal alone" onTap={onClearChat} />

        {confirmReset ? (
          <div
            style={{
              border: '3px solid var(--stardew-border-dark)',
              padding: '12px 14px',
              background: 'rgba(255, 200, 220, 0.45)',
              marginTop: 6,
              fontSize: 16,
              color: 'var(--stardew-text)',
            }}
          >
            <div style={{ marginBottom: 10, lineHeight: 1.25 }}>
              this erases everything — princess, garden, journal, chat. are you sure?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onResetWorld}
                className="stardew-button"
                style={{
                  flex: 1,
                  padding: '8px 0 10px',
                  fontSize: 16,
                  background: '#c11843',
                  color: '#fff',
                }}
              >
                yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="stardew-button"
                style={{
                  flex: 1,
                  padding: '8px 0 10px',
                  fontSize: 16,
                }}
              >
                no, sorry
              </button>
            </div>
          </div>
        ) : (
          <Row
            label="reset the kingdom"
            subtitle="erases princess, garden, journal — fresh start"
            onTap={() => setConfirmReset(true)}
            tone="danger"
          />
        )}

        <div
          style={{
            marginTop: 16,
            fontSize: 14,
            opacity: 0.7,
            textAlign: 'center',
            color: 'var(--stardew-text-soft)',
            letterSpacing: 0.5,
          }}
        >
          made with care · long may she reign 🌻
        </div>
      </div>
    </div>
  );
};

const Row = ({
  label,
  subtitle,
  onTap,
  tone,
}: {
  label: string;
  subtitle: string;
  onTap: () => void;
  tone?: 'danger';
}) => (
  <button
    onClick={onTap}
    className="stardew-button"
    style={{
      width: '100%',
      textAlign: 'left',
      padding: '10px 14px 12px',
      marginBottom: 8,
      cursor: 'pointer',
    }}
  >
    <div
      style={{
        fontSize: 18,
        color: tone === 'danger' ? '#c11843' : 'var(--stardew-text)',
        letterSpacing: 0.5,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 14,
        color: 'var(--stardew-text-soft)',
        marginTop: 4,
        lineHeight: 1.1,
        letterSpacing: 0.3,
      }}
    >
      {subtitle}
    </div>
  </button>
);
