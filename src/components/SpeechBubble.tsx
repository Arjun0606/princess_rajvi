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
    const hide = setTimeout(() => setShown(null), 7500);
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
      // Anchor above princess head — princess fills 58vh from 14vh,
      // so her head is around 60vh from bottom. Position bubble just above.
      bottom: 'min(64vh, 540px)',
      transform: 'translateX(-50%)',
      maxWidth: 'min(82vw, 320px)',
      background: 'rgba(255, 248, 240, 0.96)',
      color: '#3a1a30',
      padding: '14px 18px',
      borderRadius: 22,
      fontSize: 15.5,
      fontWeight: 600,
      lineHeight: 1.4,
      textAlign: 'center',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.6)',
      animation: 'pop 0.3s cubic-bezier(.2,.7,.2,1)',
      zIndex: 12,
      fontFamily: 'ui-rounded, system-ui, -apple-system, sans-serif',
    }}
  >
    {children}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -10,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '12px solid rgba(255, 248, 240, 0.96)',
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
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#ff5d8f',
          animation: `float 1s ease-in-out infinite`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </span>
);
