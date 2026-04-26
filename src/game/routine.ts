import { Activity, Pose } from './state';

// What is princess doing right now? Drives default pose + which actions
// she's most receptive to. Hours are 0..23 in her local (device) time.
export const activityFor = (hour: number): Activity => {
  if (hour < 6) return 'sleeping';
  if (hour < 8) return 'waking';
  if (hour < 11) return 'morning';
  if (hour < 13) return 'noon';
  if (hour < 15) return 'afternoon';
  if (hour < 17) return 'garden';
  if (hour < 19) return 'cocktail';
  if (hour < 21) return 'dinner';
  if (hour < 23) return 'stoned';
  return 'sleeping';
};

// Default pose if she's not actively doing something the player triggered.
export const naturalPoseFor = (activity: Activity): Pose => {
  switch (activity) {
    case 'sleeping': return 'sleep';
    case 'waking':   return 'default';
    case 'morning':  return 'default';
    case 'noon':     return 'sunflower';
    case 'afternoon':return 'default';
    case 'garden':   return 'sunflower';
    case 'cocktail': return 'jager';
    case 'dinner':   return 'default';
    case 'stoned':   return 'joint';
  }
};

// Brief, friendly label shown in the title strip.
export const activityLabel = (a: Activity): string => {
  switch (a) {
    case 'sleeping': return 'sleeping';
    case 'waking':   return 'waking up';
    case 'morning':  return 'holding court';
    case 'noon':     return 'reading in the garden';
    case 'afternoon':return 'an afternoon lull';
    case 'garden':   return 'tending the sunflowers';
    case 'cocktail': return 'cocktail hour';
    case 'dinner':   return 'dinner';
    case 'stoned':   return 'a quiet evening';
  }
};

// Ambient bonus — nudge a stat upward gently per minute during certain
// activities (princess takes care of herself a little when you're away).
export const ambientPerHour = (activity: Activity) => {
  switch (activity) {
    case 'garden':   return { joy: +6 };
    case 'cocktail': return { vibes: +4 };
    case 'stoned':   return { chill: +5 };
    case 'morning':  return { sass: +3 };
    default:         return {};
  }
};
