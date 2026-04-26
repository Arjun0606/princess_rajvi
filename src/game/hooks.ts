import { useEffect, useRef, useState } from 'react';

// Wall-clock that ticks every `intervalMs` so time-of-day visuals update.
export const useNow = (intervalMs = 60_000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

// True after `idleMs` of no activity. Tracks pointer + visibility events.
export const useIdle = (idleMs: number) => {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const reset = () => {
      setIdle(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIdle(true), idleMs);
    };
    reset();
    const events = ['pointerdown', 'pointermove', 'keydown', 'visibilitychange'];
    for (const e of events) window.addEventListener(e, reset, { passive: true });
    return () => {
      for (const e of events) window.removeEventListener(e, reset);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idleMs]);
  return idle;
};

// Device tilt (gamma = left/right) normalised to roughly [-1, 1].
export const useTilt = () => {
  const [tilt, setTilt] = useState(0);
  useEffect(() => {
    const handler = (ev: DeviceOrientationEvent) => {
      const g = ev.gamma ?? 0; // -90..90
      setTilt(Math.max(-1, Math.min(1, g / 35)));
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);
  return tilt;
};

// iOS requires a user-gesture grant for DeviceOrientation. Returns a function
// that requests permission; safe no-op on platforms that don't need it.
export const requestTiltPermission = async (): Promise<boolean> => {
  const D = (window as unknown as {
    DeviceOrientationEvent?: { requestPermission?: () => Promise<'granted' | 'denied'> };
  }).DeviceOrientationEvent;
  if (D?.requestPermission) {
    try {
      const result = await D.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  return true;
};

// Lightweight haptic ping. No-op where unsupported.
export const haptic = (kind: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const ms = kind === 'heavy' ? 30 : kind === 'medium' ? 18 : 8;
  navigator.vibrate(ms);
};
