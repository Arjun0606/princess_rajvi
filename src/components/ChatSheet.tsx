import { useEffect, useRef, useState } from 'react';
import { ChatMessage, Pose } from '../game/state';

type Props = {
  open: boolean;
  messages: ChatMessage[];
  pose: Pose;
  onSend: (text: string) => Promise<void>;
  onClose: () => void;
  busy: boolean;
};

const POSE_TO_FILE: Record<Pose, string> = {
  default: '/art/princess-default.png',
  coke: '/art/princess-coke.png',
  jager: '/art/princess-jager.png',
  joint: '/art/princess-joint.png',
  sunflower: '/art/princess-sunflower.png',
  sleep: '/art/princess-sleep.png',
};

export const ChatSheet = ({ open, messages, pose, onSend, onClose, busy }: Props) => {
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setMounted(true));
    else setMounted(false);
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  if (!open) return null;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    await onSend(text);
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40, 20, 50, 0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 55,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '78vh',
          minHeight: 360,
          background:
            'linear-gradient(180deg, #fff5e8 0%, #ffe1c6 100%)',
          borderRadius: '20px 20px 0 0',
          border: '4px solid #c4856b',
          borderBottomWidth: 0,
          boxShadow: '0 -16px 40px rgba(0,0,0,0.45)',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(.2,.7,.2,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          imageRendering: 'pixelated' as const,
        }}
      >
        <Header pose={pose} onClose={onClose} />

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(255, 248, 232, 0.4)',
          }}
        >
          {messages.length === 0 && (
            <Empty pose={pose} />
          )}
          {messages.map((m) => (
            <Bubble key={m.id} message={m} />
          ))}
          {busy && <BusyBubble />}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 12px calc(env(safe-area-inset-bottom, 0) + 12px)',
            background: 'rgba(255, 240, 220, 0.85)',
            borderTop: '2px solid rgba(196, 133, 107, 0.3)',
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="say something to her..."
            autoFocus
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 14,
              border: '2px solid rgba(196, 133, 107, 0.4)',
              background: '#fffaf2',
              fontSize: 15,
              color: '#3a1a30',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={busy || !draft.trim()}
            style={{
              padding: '10px 18px',
              borderRadius: 14,
              border: 'none',
              background: busy || !draft.trim() ? '#d8a8b0' : '#ff5d8f',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,93,143,0.4)',
              transition: 'transform 0.1s ease',
            }}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ pose, onClose }: { pose: Pose; onClose: () => void }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      background: 'linear-gradient(180deg, #ffd6b3 0%, #ffb88c 100%)',
      borderBottom: '3px solid #c4856b',
    }}
  >
    <Portrait pose={pose} />
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: 1,
          color: '#3a1a30',
          textTransform: 'uppercase',
        }}
      >
        Princess Rajvi
      </div>
      <div style={{ fontSize: 11, opacity: 0.65, color: '#5a2a40' }}>
        her royal highness
      </div>
    </div>
    <button
      onClick={onClose}
      aria-label="close"
      style={{
        width: 32,
        height: 32,
        border: 'none',
        background: 'rgba(58, 26, 48, 0.15)',
        borderRadius: 10,
        fontSize: 18,
        fontWeight: 700,
        color: '#3a1a30',
        cursor: 'pointer',
      }}
    >
      ×
    </button>
  </div>
);

const Portrait = ({ pose }: { pose: Pose }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: 12,
      background: 'rgba(255, 240, 220, 0.6)',
      border: '2px solid #c4856b',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <img
      src={POSE_TO_FILE[pose]}
      alt=""
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top',
        imageRendering: 'pixelated',
      }}
    />
    <span
      style={{
        position: 'absolute',
        fontSize: 32,
        zIndex: -1,
      }}
    >
      👑
    </span>
  </div>
);

const Bubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser ? '#ff5d8f' : '#fff8e8',
          color: isUser ? '#fff' : '#3a1a30',
          fontSize: 14.5,
          lineHeight: 1.4,
          fontWeight: 600,
          border: isUser ? 'none' : '2px solid rgba(196, 133, 107, 0.3)',
          boxShadow: isUser
            ? '0 2px 6px rgba(255,93,143,0.35)'
            : '0 2px 6px rgba(0,0,0,0.06)',
          whiteSpace: 'pre-wrap',
          animation: 'pop 0.25s ease',
        }}
      >
        {message.text}
      </div>
    </div>
  );
};

const BusyBubble = () => (
  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '16px 16px 16px 4px',
        background: '#fff8e8',
        border: '2px solid rgba(196, 133, 107, 0.3)',
        display: 'inline-flex',
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#ff5d8f',
            animation: 'float 1s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const Empty = ({ pose }: { pose: Pose }) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      opacity: 0.6,
      padding: 20,
      fontStyle: 'italic',
      fontSize: 13,
      color: '#5a2a40',
    }}
  >
    <div style={{ fontSize: 36, marginBottom: 6 }}>{pose === 'sleep' ? '💤' : '👑'}</div>
    {pose === 'sleep'
      ? 'shhh she is sleeping. you can still leave a note.'
      : 'say anything. she\'ll respond.'}
  </div>
);
