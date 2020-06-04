import '../domrect-polyfill';

/**
  Shifts the coordinates of the given bounds using the provided
  x and y axis offset.

  @private
  @function shiftedBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {number} dx X axis offset.
  @param {number} dy Y axis offset.
  @return {Object} The newly calculated bounds.
*/
export function shiftedBounds(
  bounds: DOMRect,
  dx: number,
  dy: number,
): DOMRect {
  return new DOMRect(bounds.x + dx, bounds.y + dy, bounds.width, bounds.height);
}

/**
  Resizes the coordinates of the given bounds using the provided
  width and height.

  @private
  @function resizedBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {number} width The target width.
  @param {number} height The target height.
  @return {Object} The newly calculated bounds.
*/
export function resizedBounds(
  bounds: DOMRect,
  width: number,
  height: number,
): DOMRect {
  return new DOMRect(bounds.x, bounds.y, width, height);
}

/**
  Shifts the coordinates of the given bounds so they are relative to
  the offset.

  @private
  @function relativeBounds
  @hide
  @param {Object} bounds The original bounds.
  @param {Object} offset The offset.
  @return {Object} The newly calculated bounds.
*/
export function relativeBounds(
  bounds: DOMRect,
  offset: { left: number; top: number },
): DOMRect {
  return shiftedBounds(bounds, -offset.left, -offset.top);
}

/**
  An empty bounds object.

  @private
  @hide
  @constant {Object} emptyBounds
*/
export const emptyBounds = Object.freeze(new DOMRect(0, 0, 0, 0));
