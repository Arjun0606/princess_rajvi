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
    className="stardew-box"
    style={{
      position: 'absolute',
      left: '50%',
      top: 'calc(env(safe-area-inset-top, 0) + 130px)',
      transform: 'translateX(-50%)',
      maxWidth: 'min(88vw, 360px)',
      padding: '14px 18px 16px',
      borderRadius: 4,
      fontSize: 22,
      lineHeight: 1.05,
      letterSpacing: 0.5,
      textAlign: 'center',
      animation: 'pop 0.25s cubic-bezier(.2,.7,.2,1)',
      zIndex: 12,
    }}
  >
    {children}
    {/* Bubble tail pointing down at princess */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -14,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: '14px solid #8a5230',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: -8,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '8px solid #fff5dc',
      }}
    />
  </div>
);

const Dots = () => (
  <span style={{ display: 'inline-flex', gap: 6, fontSize: 26, letterSpacing: 4 }}>
    <span style={{ animation: 'float 1s ease-in-out infinite' }}>.</span>
    <span style={{ animation: 'float 1s ease-in-out infinite', animationDelay: '0.15s' }}>.</span>
    <span style={{ animation: 'float 1s ease-in-out infinite', animationDelay: '0.3s' }}>.</span>
  </span>
);
