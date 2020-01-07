export function easeInAndOut(t: number) {
  return 0.5 - Math.cos(t * Math.PI) / 2;
}

// if we naively switch from cosine to linear for the second half, we
// would finish too soon. This is the adjustment factor that keeps us
// within the 0 to 1 window.
const adjust = 1 / 2 + 1 / Math.PI;

const cutover = 1 / (2 * adjust);
const b = (2 - Math.PI) / 4;
const m = (Math.PI / 2) * adjust;

export function easeIn(t: number) {
  if (t < cutover) {
    return easeInAndOut(t * adjust);
  } else {
    return m * t + b;
  }
}

export function easeOut(t: number) {
  return 1 - easeIn(1 - t);
}
