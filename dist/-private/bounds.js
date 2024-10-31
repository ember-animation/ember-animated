import { _ as _applyDecoratedDescriptor, b as _initializerDefineProperty } from '../_rollupPluginBabelHelpers-iYhWj1qN.js';

var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4;
// Polyfill DOMRect
// It's not available on Edge or IE11

function nonEnumerable(target, propertyKey) {
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  if (descriptor.enumerable != false) {
    descriptor.enumerable = false;
    Object.defineProperty(target, propertyKey, descriptor);
  }
}
let DOMRectPolyfill = (_class = class DOMRectPolyfill {
  static fromRect(rect = {}) {
    return new DOMRect(rect.x ?? 0, rect.y ?? 0, rect.width ?? 0, rect.height ?? 0);
  }
  constructor(x, y, width, height) {
    // DOMRect's properties are all non-enumerable
    _initializerDefineProperty(this, "x", _descriptor, this);
    _initializerDefineProperty(this, "y", _descriptor2, this);
    _initializerDefineProperty(this, "width", _descriptor3, this);
    _initializerDefineProperty(this, "height", _descriptor4, this);
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
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "x", [nonEnumerable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "y", [nonEnumerable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "width", [nonEnumerable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "height", [nonEnumerable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return 0;
  }
})), _class);
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
