import { ActionKind } from '../game/state';
import { CRAVING_EMOJI } from '../game/cravings';

type Props = {
  craving: ActionKind | null;
  // Princess position in 0..1 map coords — bubble anchors above her head.
  xPct: number;
  yPct: number;
  // Sprite height in px so we can offset the bubble correctly.
  spriteHeight?: number;
};

// A small pixel-art thought bubble that floats over the princess showing
// the emoji of what she's currently craving. Puffs out of nothing with
// a pop, then gently bobs while it lives.
export const ThoughtBubble = ({ craving, xPct, yPct, spriteHeight = 48 }: Props) => {
  if (craving === null || craving === 'tap') return null;
  const emoji = CRAVING_EMOJI[craving as keyof typeof CRAVING_EMOJI];
  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPct * 100}%`,
        top: `${yPct * 100}%`,
        // Anchor at princess head: shift up past her sprite + a little extra.
        transform: `translate(-50%, calc(-100% - ${spriteHeight + 12}px))`,
        zIndex: 6,
        pointerEvents: 'none',
        animation: 'pop 0.4s ease, float 2.4s ease-in-out infinite',
      }}
    >
      <div
        style={{
          background: '#fff5dc',
          border: '2px solid #4a2710',
          padding: '4px 8px 5px',
          borderRadius: 8,
          fontSize: 18,
          lineHeight: 1,
          boxShadow:
            '0 0 0 1px #c89a5e, 2px 2px 0 0 rgba(74,39,16,0.35)',
          fontFamily: 'var(--pixel-font)',
          color: '#4a2710',
        }}
      >
        {emoji}
      </div>
      {/* Bubble tail — three shrinking dots pointing down to her head */}
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff5dc', border: '1px solid #4a2710' }} />
      </div>
      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 1 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff5dc', border: '1px solid #4a2710' }} />
      </div>
    </div>
  );
};
