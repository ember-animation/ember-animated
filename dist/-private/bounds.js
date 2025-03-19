import { g, i } from 'decorator-transforms/runtime';

// Polyfill DOMRect
// It's not available on Edge or IE11

function nonEnumerable(target, propertyKey) {
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  if (descriptor.enumerable != false) {
    descriptor.enumerable = false;
    Object.defineProperty(target, propertyKey, descriptor);
  }
}
class DOMRectPolyfill {
  static fromRect(rect = {}) {
    return new DOMRect(rect.x ?? 0, rect.y ?? 0, rect.width ?? 0, rect.height ?? 0);
  }
  constructor(x, y, width, height) {
    if (x != null) {
      this.x = x;
    }
    if (y != null) {
      this.y = y;
    }
    if (width != null) {
      this.width = width;
    }
    if (height != null) {
      this.height = height;
    }
  }

  // DOMRect's properties are all non-enumerable
  static {
    g(this.prototype, "x", [nonEnumerable], function () {
      return 0;
    });
  }
  #x = (i(this, "x"), void 0);
  static {
    g(this.prototype, "y", [nonEnumerable], function () {
      return 0;
    });
  }
  #y = (i(this, "y"), void 0);
  static {
    g(this.prototype, "width", [nonEnumerable], function () {
      return 0;
    });
  }
  #width = (i(this, "width"), void 0);
  static {
    g(this.prototype, "height", [nonEnumerable], function () {
      return 0;
    });
  }
  #height = (i(this, "height"), void 0);
  get top() {
    return this.y;
  }
  get right() {
    return this.x + this.width;
  }
  get bottom() {
    return this.y + this.height;
  }
  get left() {
    return this.x;
  }

  // But it has a toJSON that does include all the properties.
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left
    };
  }
}
if (typeof window !== 'undefined' && !window.DOMRect) {
  window.DOMRect = DOMRectPolyfill;
}

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
function shiftedBounds(bounds, dx, dy) {
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
function resizedBounds(bounds, width, height) {
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
function relativeBounds(bounds, offset) {
  return shiftedBounds(bounds, -offset.left, -offset.top);
}

/**
  An empty bounds object.

  @private
  @hide
  @constant {Object} emptyBounds
*/
const emptyBounds = Object.freeze(new DOMRect(0, 0, 0, 0));

export { emptyBounds, relativeBounds, resizedBounds, shiftedBounds };
//# sourceMappingURL=bounds.js.map
