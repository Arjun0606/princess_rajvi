import { useEffect, useState } from 'react';
import { ActionKind } from '../game/state';
import { CRAVING_EMOJI } from '../game/cravings';

type Props = {
  craving: ActionKind | null;
  // Princess position in 0..1 map coords — bubble anchors above her head.
  xPct: number;
  yPct: number;
  // Hard timestamp when the craving expires; used to drive the live timer.
  expiresAt: number;
  // Total duration of the craving timer in ms (so we can show 0..1 fill).
  totalMs: number;
  // Sprite height in px so we can offset the bubble correctly.
  spriteHeight?: number;
};

// Pixel-art thought bubble with a LIVE timer bar. The bubble shows what
// princess is craving (emoji); the bar shrinks toward 0 as time runs out.
// When the timer bar reaches the danger zone, the bubble flashes red.
export const ThoughtBubble = ({
  craving,
  xPct,
  yPct,
  expiresAt,
  totalMs,
  spriteHeight = 48,
}: Props) => {
  // Internal 200ms tick to drive the timer bar. Cheaper than re-rendering
  // the whole game state every frame.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (craving === null || craving === 'tap') return;
    const t = setInterval(() => setTick((n) => n + 1), 200);
    return () => clearInterval(t);
  }, [craving]);

  if (craving === null || craving === 'tap') return null;
  const emoji = CRAVING_EMOJI[craving as keyof typeof CRAVING_EMOJI];
  const remaining = Math.max(0, expiresAt - Date.now());
  const fraction = Math.max(0, Math.min(1, remaining / totalMs));
  const danger = fraction < 0.3;

  // Bar color shifts green → yellow → red as time runs out.
  const barColor =
    fraction > 0.5 ? '#5fc55f' : fraction > 0.25 ? '#ffd84d' : '#d2202a';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct * 100}%`,
        top: `${yPct * 100}%`,
        transform: `translate(-50%, calc(-100% - ${spriteHeight + 12}px))`,
        zIndex: 6,
        pointerEvents: 'none',
        animation: danger
          ? 'shimmer 0.4s ease-in-out infinite, float 1.4s ease-in-out infinite'
          : 'pop 0.4s ease, float 2.4s ease-in-out infinite',
      }}
    >
      <div
        style={{
          background: '#fff5dc',
          border: '2px solid #4a2710',
          padding: '4px 8px 4px',
          borderRadius: 8,
          fontSize: 18,
          lineHeight: 1,
          boxShadow:
            '0 0 0 1px #c89a5e, 2px 2px 0 0 rgba(74,39,16,0.35)',
          fontFamily: 'var(--pixel-font)',
          color: '#4a2710',
          minWidth: 60,
          textAlign: 'center',
        }}
      >
        {emoji}
        {/* Timer bar */}
        <div
          style={{
            marginTop: 3,
            height: 4,
            width: '100%',
            background: '#3a1d0a',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${fraction * 100}%`,
              background: barColor,
              transition: 'width 0.2s linear, background 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          />
        </div>
        {/* Numeric countdown when in danger zone */}
        {danger && (
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              color: '#d2202a',
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {Math.ceil(remaining / 1000)}s
          </div>
        )}
      </div>
      {/* Bubble tail */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff5dc', border: '1px solid #4a2710' }} />
      </div>
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 1 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff5dc', border: '1px solid #4a2710' }} />
      </div>
    </div>
  );
};
