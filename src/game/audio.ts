// Procedural sound design via Web Audio API. No asset files. Each sound
// is a tiny synthesised blip designed to feel chunky and pixel-art-y,
// not realistic. All sounds gated through a single shared AudioContext
// so we don't burn through browser limits.
//
// Usage:
//   import { sfx } from './audio';
//   sfx('pickup');

let ctx: AudioContext | null = null;
let muted = false;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
};

// Small helper: play a short tone with a frequency envelope and gain
// envelope. Mimics chiptune.
const tone = ({
  freq,
  endFreq,
  duration,
  type = 'square',
  gain = 0.06,
  delay = 0,
}: {
  freq: number;
  endFreq?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}) => {
  const c = getCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t0 + duration);
  }
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
};

export type Sfx =
  | 'footstep'
  | 'pickup'
  | 'pickup-flower'
  | 'station'
  | 'tap'
  | 'water'
  | 'chime';

export const sfx = (kind: Sfx) => {
  // Resume on user gesture (browsers suspend the context until then).
  const c = getCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
  switch (kind) {
    case 'footstep':
      tone({ freq: 280, endFreq: 180, duration: 0.06, type: 'triangle', gain: 0.03 });
      break;
    case 'pickup':
      tone({ freq: 880,  duration: 0.08, type: 'square',   gain: 0.05 });
      tone({ freq: 1320, duration: 0.08, type: 'triangle', gain: 0.04, delay: 0.06 });
      break;
    case 'pickup-flower':
      // Two-note ascending chime — sweet for picking a daisy
      tone({ freq: 988,  duration: 0.10, type: 'sine',     gain: 0.06 });
      tone({ freq: 1318, duration: 0.18, type: 'triangle', gain: 0.05, delay: 0.07 });
      break;
    case 'station':
      // Three-note arpeggio for collecting at a station
      tone({ freq: 523,  duration: 0.10, type: 'square',   gain: 0.05 });
      tone({ freq: 659,  duration: 0.10, type: 'square',   gain: 0.05, delay: 0.08 });
      tone({ freq: 880,  duration: 0.18, type: 'triangle', gain: 0.05, delay: 0.16 });
      break;
    case 'tap':
      tone({ freq: 660, endFreq: 440, duration: 0.05, type: 'triangle', gain: 0.025 });
      break;
    case 'water':
      tone({ freq: 220, endFreq: 120, duration: 0.18, type: 'sine', gain: 0.04 });
      tone({ freq: 320, endFreq: 220, duration: 0.18, type: 'sine', gain: 0.03, delay: 0.04 });
      break;
    case 'chime':
      tone({ freq: 1175, duration: 0.45, type: 'sine', gain: 0.05 });
      tone({ freq: 1568, duration: 0.55, type: 'sine', gain: 0.04, delay: 0.18 });
      break;
  }
};

export const setMuted = (m: boolean) => {
  muted = m;
};

export const isMuted = () => muted;
