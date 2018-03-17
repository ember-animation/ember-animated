/**
  Shifts the coordinates of the given bounds using the provided
  x and y axis offset.

  @function shiftedBounds
  @param {Object} bounds The original bounds.
  @param {number} dx X axis offset.
  @param {number} dy Y axis offset.
  @return {Object} The newly calculated bounds.
*/
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

/**
  Resizes the coordinates of the given bounds using the provided
  width and height.

  @function resizedBounds
  @param {Object} bounds The original bounds.
  @param {number} width The target width.
  @param {number} height The target height.
  @return {Object} The newly calculated bounds.
*/
export function resizedBounds(bounds, width, height) {
  return {
    top: bounds.top,
    bottom: bounds.top + height,
    left: bounds.left,
    right: bounds.left + width,
    width: width,
    height: height
  };
}

/**
  Shifts the coordinates of the given bounds so they are relative to
  the offset.

  @function relativeBounds
  @param {Object} bounds The original bounds.
  @param {Object} offset The offset.
  @return {Object} The newly calculated bounds.
*/
export function relativeBounds(bounds, offset) {
  return shiftedBounds(bounds, -offset.left, -offset.top);
}

/**
  An empty bounds object.

  @constant {Object} emptyBounds
*/
export const emptyBounds = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0
};

Object.freeze(emptyBounds);
