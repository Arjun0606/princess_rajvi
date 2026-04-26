import { useEffect, useState } from 'react';

type Props = {
  text: string | null;
  loading?: boolean;
};

export const SpeechBubble = ({ text, loading }: Props) => {
  const [shown, setShown] = useState<string | null>(null);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!text) return;
    setShown(text);
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    const hide = setTimeout(() => setShown(null), 6500);
    return () => {
      clearInterval(id);
      clearTimeout(hide);
    };
  }, [text]);

  if (loading) {
    return (
      <Bubble>
        <Dots />
      </Bubble>
    );
  }
  if (!shown) return null;
  return <Bubble>{typed}</Bubble>;
};

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: 'calc(env(safe-area-inset-top, 0) + 88px)',
      transform: 'translateX(-50%)',
      maxWidth: 'min(86vw, 320px)',
      background: 'rgba(255, 255, 255, 0.96)',
      color: '#2a1340',
      padding: '12px 16px',
      borderRadius: 18,
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.35,
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      animation: 'pop 0.3s ease',
      zIndex: 12,
    }}
  >
    {children}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -8,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '10px solid rgba(255,255,255,0.96)',
      }}
    />
  </div>
);

const Dots = () => (
  <span style={{ display: 'inline-flex', gap: 4 }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#ff5d8f',
          animation: `float 1s ease-in-out infinite`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </span>
);
