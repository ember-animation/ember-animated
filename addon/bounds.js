export function shiftedBounds(bounds, dx, dy) {
  return {
    top: bounds.top + dy,
    bottom: bounds.bottom + dy,
    left: bounds.left + dx,
    right: bounds.right + dx,
    width: bounds.width,
    height: bounds.height
  };
}

// shifts the coordinates of the given bounds so they are relative to
// the offset.
export function relativeBounds(bounds, offset) {
  return shiftedBounds(bounds, -offset.left, -offset.top);
}

export const emptyBounds = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0
};

Object.freeze(emptyBounds);
