import { useEffect, useState } from 'react';
import { JournalEntry } from '../game/state';

type Props = {
  entries: JournalEntry[];
  startedAt: number;
  onClose: () => void;
};

const KIND_ICON: Record<JournalEntry['kind'], string> = {
  daily: '☀️',
  return: '💌',
  action: '✨',
  milestone: '👑',
  firstrun: '🌻',
};

const KIND_LABEL: Record<JournalEntry['kind'], string> = {
  daily: 'morning dispatch',
  return: 'a letter on your return',
  action: 'a note',
  milestone: 'milestone',
  firstrun: 'the very first letter',
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return `today · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (sameDay(d, yesterday)) return `yesterday · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const pad = (n: number) => String(n).padStart(2, '0');

export const Journal = ({ entries, startedAt, onClose }: Props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const days = Math.floor((Date.now() - startedAt) / (24 * 60 * 60 * 1000));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40, 20, 50, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 0 0',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '88vh',
          background:
            'linear-gradient(180deg, #fff5e8 0%, #ffe3d0 100%)',
          borderRadius: '24px 24px 0 0',
          padding: '20px 22px 28px',
          color: '#3a1a1a',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.45s cubic-bezier(.2,.7,.2,1)',
          overflowY: 'auto',
          fontFamily: 'Georgia, "New York", serif',
        }}
      >
        <Handle />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 4,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 0.5 }}>
            the royal diary
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              color: '#3a1a1a',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 18 }}>
          day {days + 1} of friendship · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>

        {entries.length === 0 ? (
          <Empty />
        ) : (
          entries.map((e) => <Entry key={e.id} entry={e} />)
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: 22,
            fontStyle: 'italic',
            fontSize: 12,
            opacity: 0.45,
          }}
        >
          long may she reign 🌻
        </div>
      </div>
    </div>
  );
};

const Handle = () => (
  <div
    style={{
      width: 40,
      height: 4,
      background: 'rgba(58,26,26,0.2)',
      borderRadius: 2,
      margin: '0 auto 14px',
    }}
  />
);

const Entry = ({ entry }: { entry: JournalEntry }) => {
  const icon = entry.icon ?? KIND_ICON[entry.kind];
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 12,
        boxShadow: 'inset 0 0 0 1px rgba(58,26,26,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          opacity: 0.65,
          marginBottom: 8,
        }}
      >
        <span>
          {icon} {KIND_LABEL[entry.kind]}
        </span>
        <span>{formatDate(entry.at)}</span>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{entry.text}</div>
    </div>
  );
};

const Empty = () => (
  <div
    style={{
      padding: '40px 16px',
      textAlign: 'center',
      opacity: 0.55,
      fontStyle: 'italic',
      fontSize: 14,
    }}
  >
    the princess has not yet written. take care of her and her letters will gather here.
  </div>
);
