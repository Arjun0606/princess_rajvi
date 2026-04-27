import { useEffect, useState } from 'react';
import { JournalEntry } from '../game/state';

type Props = {
  entries: JournalEntry[];
  startedAt: number;
  onClose: () => void;
};

const KIND_ICON: Record<JournalEntry['kind'], string> = {
  daily: '☀',
  return: '✉',
  action: '✦',
  milestone: '★',
  firstrun: '🌻',
};

const KIND_LABEL: Record<JournalEntry['kind'], string> = {
  daily: 'morning dispatch',
  return: 'a letter on your return',
  action: 'a note',
  milestone: 'milestone',
  firstrun: 'the first letter',
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
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 50,
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
          maxHeight: '88vh',
          borderRadius: 0,
          padding: '20px 18px 24px',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.45s cubic-bezier(.2,.7,.2,1)',
          overflowY: 'auto',
          fontFamily: 'var(--pixel-font)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--stardew-border-mid)',
            borderRadius: 2,
            margin: '0 auto 12px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: 1,
              color: 'var(--stardew-text)',
              lineHeight: 1,
            }}
          >
            the royal diary
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
            fontSize: 14,
            color: 'var(--stardew-text-soft)',
            marginBottom: 16,
            letterSpacing: 0.5,
          }}
        >
          day {days + 1} · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>

        {entries.length === 0 ? (
          <Empty />
        ) : (
          entries.map((e) => <Entry key={e.id} entry={e} />)
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: 18,
            fontSize: 14,
            color: 'var(--stardew-text-soft)',
            opacity: 0.7,
            letterSpacing: 0.5,
          }}
        >
          long may she reign 🌻
        </div>
      </div>
    </div>
  );
};

const Entry = ({ entry }: { entry: JournalEntry }) => {
  const icon = entry.icon ?? KIND_ICON[entry.kind];
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.45)',
        border: '2px solid var(--stardew-border-mid)',
        boxShadow:
          'inset 0 0 0 1px var(--stardew-border-light), 2px 2px 0 0 var(--stardew-border-dark)',
        padding: '10px 12px 12px',
        marginBottom: 12,
        fontFamily: 'var(--pixel-font)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          color: 'var(--stardew-text-soft)',
          marginBottom: 6,
          lineHeight: 1,
        }}
      >
        <span>
          {icon} {KIND_LABEL[entry.kind]}
        </span>
        <span>{formatDate(entry.at)}</span>
      </div>
      <div
        style={{
          fontSize: 18,
          lineHeight: 1.25,
          color: 'var(--stardew-text)',
          whiteSpace: 'pre-wrap',
          letterSpacing: 0.3,
        }}
      >
        {entry.text}
      </div>
    </div>
  );
};

const Empty = () => (
  <div
    style={{
      padding: '32px 16px',
      textAlign: 'center',
      color: 'var(--stardew-text-soft)',
      fontSize: 18,
      lineHeight: 1.3,
    }}
  >
    the princess has not yet written. take care of her and her letters will gather here.
  </div>
);
