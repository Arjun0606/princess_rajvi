// Sky color and sun/moon position from the device's local clock.

export type SkyPhase = 'dawn' | 'day' | 'dusk' | 'night';

export const phaseFor = (hour: number): SkyPhase => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
};

export const skyGradient = (hour: number, minute: number): string => {
  const t = hour + minute / 60;
  // Smoothly blend between palette stops so dusk slides into night.
  const stops: { at: number; top: string; bottom: string }[] = [
    { at: 0, top: '#0b0b2a', bottom: '#2a1840' },
    { at: 5, top: '#3b2b54', bottom: '#ff9a8b' },
    { at: 7, top: '#7ec8e3', bottom: '#ffd6a5' },
    { at: 12, top: '#9ad4ff', bottom: '#fce7f3' },
    { at: 17, top: '#ffb88c', bottom: '#ff6f91' },
    { at: 19.5, top: '#5c4396', bottom: '#ff8aae' },
    { at: 21, top: '#1a1340', bottom: '#3d2766' },
    { at: 24, top: '#0b0b2a', bottom: '#2a1840' },
  ];
  let lo = stops[0]!;
  let hi = stops[stops.length - 1]!;
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i]!.at && t <= stops[i + 1]!.at) {
      lo = stops[i]!;
      hi = stops[i + 1]!;
      break;
    }
  }
  const span = hi.at - lo.at || 1;
  const k = (t - lo.at) / span;
  const top = blend(lo.top, hi.top, k);
  const bottom = blend(lo.bottom, hi.bottom, k);
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
};

const blend = (a: string, b: string, k: number): string => {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * k);
  const g = Math.round(ag + (bg - ag) * k);
  const bl = Math.round(ab + (bb - ab) * k);
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
};

// Sun position across the sky 0..1 (0 = sunrise, 0.5 = noon, 1 = sunset).
export const sunPosition = (hour: number, minute: number): number => {
  const t = hour + minute / 60;
  if (t < 6 || t > 19) return -1;
  return (t - 6) / 13;
};

// Same idea for the moon at night.
export const moonPosition = (hour: number, minute: number): number => {
  const t = hour + minute / 60;
  if (t >= 6 && t <= 19) return -1;
  const adj = t < 6 ? t + 24 : t;
  return (adj - 19) / 11;
};

// Approx moon phase (0 = new, 0.5 = full, 1 = back to new).
export const moonPhase = (date: Date): number => {
  // Knuth-ish approximation; close enough for vibes.
  const lp = 2551443; // synodic month in seconds
  const newMoonRef = new Date('2000-01-06T18:14:00Z').getTime() / 1000;
  const phase = ((date.getTime() / 1000 - newMoonRef) % lp) / lp;
  return phase < 0 ? phase + 1 : phase;
};
