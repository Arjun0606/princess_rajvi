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
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(180deg, #fff5e8 0%, #ffe1c6 100%)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 22px calc(env(safe-area-inset-bottom, 0) + 28px)',
          color: '#3a1a30',
          boxShadow: '0 -16px 40px rgba(0,0,0,0.4)',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(.2,.7,.2,1)',
          fontFamily: 'ui-rounded, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'rgba(58,26,48,0.2)',
            borderRadius: 2,
            margin: '0 auto 14px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.5 }}>
            the kingdom
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              color: '#3a1a30',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            padding: '12px 14px',
            borderRadius: 14,
            marginBottom: 14,
            fontSize: 13,
          }}
        >
          you and princess rajvi have been friends for{' '}
          <strong>day {daysTogether + 1}</strong>. long may you reign.
        </div>

        <Row
          label="clear chat history"
          subtitle="leaves the journal alone"
          onTap={onClearChat}
          tone="neutral"
        />

        {confirmReset ? (
          <div
            style={{
              border: '2px solid #ff5d8f',
              padding: '12px 14px',
              borderRadius: 14,
              background: 'rgba(255, 200, 220, 0.4)',
              marginTop: 6,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              this erases everything — princess, garden, journal, chat. are you absolutely sure?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onResetWorld}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: '#c11843',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  background: 'rgba(58,26,48,0.15)',
                  color: '#3a1a30',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                no, sorry
              </button>
            </div>
          </div>
        ) : (
          <Row
            label="reset the kingdom"
            subtitle="erases princess, garden, journal — start fresh"
            onTap={() => setConfirmReset(true)}
            tone="danger"
          />
        )}

        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            opacity: 0.55,
            textAlign: 'center',
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
  tone: 'neutral' | 'danger';
}) => (
  <button
    onClick={onTap}
    style={{
      width: '100%',
      textAlign: 'left',
      background: tone === 'danger' ? 'rgba(255, 93, 143, 0.12)' : 'rgba(255, 255, 255, 0.55)',
      border: tone === 'danger' ? '1px solid rgba(255, 93, 143, 0.35)' : '1px solid rgba(58,26,48,0.1)',
      padding: '12px 14px',
      borderRadius: 14,
      marginBottom: 8,
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 14, color: tone === 'danger' ? '#c11843' : '#3a1a30' }}>
      {label}
    </div>
    <div style={{ fontSize: 12, color: '#5a2a40', opacity: 0.6, marginTop: 2 }}>
      {subtitle}
    </div>
  </button>
);
