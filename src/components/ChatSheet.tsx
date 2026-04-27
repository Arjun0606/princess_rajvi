import { useEffect, useRef, useState } from 'react';
import { ChatMessage, Pose } from '../game/state';
import { useKeyboardOffset } from '../game/hooks';
import { PixelPrincess } from './PixelPrincess';

type Props = {
  open: boolean;
  messages: ChatMessage[];
  pose: Pose;
  onSend: (text: string) => Promise<void>;
  onClose: () => void;
  busy: boolean;
};

export const ChatSheet = ({ open, messages, pose, onSend, onClose, busy }: Props) => {
  const [draft, setDraft] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardOffset = useKeyboardOffset();

  useEffect(() => {
    if (open) requestAnimationFrame(() => setMounted(true));
    else setMounted(false);
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, keyboardOffset]);

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
        background: 'rgba(40, 20, 50, 0.55)',
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
        className="stardew-box"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: keyboardOffset > 0 ? `calc(100vh - ${keyboardOffset}px - 24px)` : '78vh',
          minHeight: 360,
          borderRadius: 0,
          padding: 0,
          transform: mounted
            ? `translateY(${dragOffset - keyboardOffset}px)`
            : 'translateY(100%)',
          transition: dragStartY.current === null
            ? 'transform 0.35s cubic-bezier(.2,.7,.2,1), max-height 0.25s ease'
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          onPointerDown={(e) => {
            dragStartY.current = e.clientY;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragStartY.current === null) return;
            const dy = e.clientY - dragStartY.current;
            if (dy > 0) setDragOffset(dy);
          }}
          onPointerUp={() => {
            if (dragStartY.current === null) return;
            const finalOffset = dragOffset;
            dragStartY.current = null;
            if (finalOffset > 90) {
              onClose();
            } else {
              setDragOffset(0);
            }
          }}
          onPointerCancel={() => {
            dragStartY.current = null;
            setDragOffset(0);
          }}
          style={{ touchAction: 'none' }}
        >
          <Header pose={pose} onClose={onClose} />
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'var(--stardew-paper-shade)',
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(74,39,16,0.04) 0 2px, transparent 2px 4px)',
          }}
        >
          {messages.length === 0 && <Empty pose={pose} />}
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
            background: 'var(--stardew-paper)',
            borderTop: '3px solid var(--stardew-border-dark)',
            boxShadow: 'inset 0 2px 0 var(--stardew-border-light)',
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="say something..."
            autoFocus
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 0,
              border: '3px solid var(--stardew-border-mid)',
              boxShadow:
                'inset 0 0 0 1px var(--stardew-border-dark), 0 0 0 1px var(--stardew-border-dark)',
              background: '#fff',
              fontSize: 18,
              color: 'var(--stardew-text)',
              fontFamily: 'var(--pixel-font)',
              outline: 'none',
              letterSpacing: 0.5,
            }}
          />
          <button
            onClick={handleSend}
            disabled={busy || !draft.trim()}
            className="stardew-button"
            style={{
              padding: '6px 14px',
              borderRadius: 0,
              fontSize: 18,
              opacity: busy || !draft.trim() ? 0.55 : 1,
              cursor: busy || !draft.trim() ? 'default' : 'pointer',
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
      background: 'var(--stardew-paper)',
      borderBottom: '3px solid var(--stardew-border-dark)',
      boxShadow: 'inset 0 -2px 0 var(--stardew-border-light)',
      cursor: 'grab',
    }}
  >
    <Portrait pose={pose} />
    <div style={{ flex: 1, fontFamily: 'var(--pixel-font)' }}>
      <div
        style={{
          fontSize: 22,
          color: 'var(--stardew-text)',
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        Princess Rajvi
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'var(--stardew-text-soft)',
          marginTop: 2,
          lineHeight: 1,
        }}
      >
        her royal highness
      </div>
    </div>
    <button
      onClick={onClose}
      aria-label="close"
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
);

const Portrait = ({ pose }: { pose: Pose }) => (
  <div
    style={{
      width: 60,
      height: 60,
      background: '#fff',
      border: '3px solid var(--stardew-border-mid)',
      boxShadow:
        'inset 0 0 0 1px var(--stardew-border-dark), 0 0 0 1px var(--stardew-border-dark)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      padding: 2,
    }}
  >
    <div style={{ width: '100%', height: '100%' }}>
      <PixelPrincess pose={pose} drunk={0} high={0} />
    </div>
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
        className={isUser ? '' : 'stardew-box'}
        style={{
          maxWidth: '78%',
          padding: isUser ? '8px 12px' : '8px 12px 9px',
          background: isUser ? 'var(--stardew-border-mid)' : undefined,
          color: isUser ? '#fff5dc' : 'var(--stardew-text)',
          fontSize: 18,
          lineHeight: 1.15,
          fontFamily: 'var(--pixel-font)',
          letterSpacing: 0.5,
          whiteSpace: 'pre-wrap',
          animation: 'pop 0.25s ease',
          borderRadius: 0,
          border: isUser ? '2px solid var(--stardew-border-dark)' : undefined,
          boxShadow: isUser
            ? '2px 2px 0 0 var(--stardew-border-dark)'
            : undefined,
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
      className="stardew-box"
      style={{
        padding: '8px 14px',
        display: 'inline-flex',
        gap: 4,
        fontFamily: 'var(--pixel-font)',
        fontSize: 22,
        letterSpacing: 4,
        lineHeight: 1,
      }}
    >
      <span style={{ animation: 'float 1s ease-in-out infinite' }}>.</span>
      <span style={{ animation: 'float 1s ease-in-out infinite', animationDelay: '0.15s' }}>.</span>
      <span style={{ animation: 'float 1s ease-in-out infinite', animationDelay: '0.3s' }}>.</span>
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
      padding: 30,
      fontFamily: 'var(--pixel-font)',
      fontSize: 18,
      color: 'var(--stardew-text-soft)',
      lineHeight: 1.2,
    }}
  >
    <div style={{ fontSize: 36, marginBottom: 8 }}>{pose === 'sleep' ? '💤' : '👑'}</div>
    {pose === 'sleep'
      ? "shhh she's sleeping. you can still leave a note."
      : "say anything. she'll respond."}
  </div>
);
