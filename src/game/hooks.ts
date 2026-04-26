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

// Tracks the on-screen keyboard via visualViewport. iOS Safari does not
// resize window.innerHeight when the keyboard opens — visualViewport.height
// shrinks instead, and we use the delta to lift fixed-bottom UI above it.
export const useKeyboardOffset = () => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;
    const handler = () => {
      // When keyboard is shown, viewport.height < layout viewport height.
      const delta = window.innerHeight - vp.height - vp.offsetTop;
      setOffset(Math.max(0, delta));
    };
    vp.addEventListener('resize', handler);
    vp.addEventListener('scroll', handler);
    handler();
    return () => {
      vp.removeEventListener('resize', handler);
      vp.removeEventListener('scroll', handler);
    };
  }, []);
  return offset;
};

// Detects a phone shake via accelerometer. Threshold chosen to require a real
// snap, not just walking. Caller-provided callback fires on each detected
// shake (rate-limited to once per 700ms).
export const useShake = (onShake: () => void) => {
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastFireAt = 0;
    let calibrated = false;
    const threshold = 22;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      if (!calibrated) {
        lastX = a.x; lastY = a.y; lastZ = a.z;
        calibrated = true;
        return;
      }
      const delta = Math.abs(a.x - lastX) + Math.abs(a.y - lastY) + Math.abs(a.z - lastZ);
      lastX = a.x; lastY = a.y; lastZ = a.z;
      if (delta > threshold && Date.now() - lastFireAt > 700) {
        lastFireAt = Date.now();
        onShake();
      }
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [onShake]);
};

// iOS requires gesture-prompted permission for DeviceMotionEvent. Shape mirrors
// requestTiltPermission. Safe no-op on platforms that don't need it.
export const requestMotionPermission = async (): Promise<boolean> => {
  const D = (window as unknown as {
    DeviceMotionEvent?: { requestPermission?: () => Promise<'granted' | 'denied'> };
  }).DeviceMotionEvent;
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
