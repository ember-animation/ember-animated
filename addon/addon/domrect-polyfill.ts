// Polyfill DOMRect
// It's not available on Edge or IE11

function nonEnumerable(target: any, propertyKey: string) {
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  if (descriptor.enumerable != false) {
    descriptor.enumerable = false;
    Object.defineProperty(target, propertyKey, descriptor);
  }
}

class DOMRectPolyfill implements DOMRect {
  static fromRect(
    rect: { x?: number; y?: number; width?: number; height?: number } = {},
  ) {
    return new this(
      rect.x ?? 0,
      rect.y ?? 0,
      rect.width ?? 0,
      rect.height ?? 0,
    );
  }

  constructor(x?: number, y?: number, width?: number, height?: number) {
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
  @nonEnumerable x = 0;
  @nonEnumerable y = 0;
  @nonEnumerable width = 0;
  @nonEnumerable height = 0;

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
      left: this.left,
    };
  }
}

if (typeof window !== 'undefined' && !window.DOMRect) {
  (window as { DOMRect: typeof DOMRect }).DOMRect = DOMRectPolyfill;
}
