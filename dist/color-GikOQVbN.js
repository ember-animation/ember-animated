import { a as _defineProperty } from './_rollupPluginBabelHelpers-iYhWj1qN.js';
import Tween from './-private/tween.js';
import linear from './easings/linear.js';
import './element-remove-EL1Tgdib.js';

class Color {
  static fromComputedStyle(colorString) {
    let channels = parseComputedColor(colorString);
    return new Color(channels, channels.m[0]);
  }
  static fromUserProvidedColor(colorString) {
    return new Color(parseUserProvidedColor(colorString), colorString);
  }
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
  constructor({
    r,
    g,
    b,
    a
  }, sourceString) {
    _defineProperty(this, "r", void 0);
    _defineProperty(this, "g", void 0);
    _defineProperty(this, "b", void 0);
    _defineProperty(this, "a", void 0);
    this.sourceString = sourceString;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
class ColorTween {
  constructor(initialColor, finalColor, duration, easing = linear) {
    _defineProperty(this, "rTween", void 0);
    _defineProperty(this, "gTween", void 0);
    _defineProperty(this, "bTween", void 0);
    _defineProperty(this, "aTween", void 0);
    this.rTween = new Tween(initialColor.r * initialColor.a, finalColor.r * finalColor.a, duration, easing);
    this.gTween = new Tween(initialColor.g * initialColor.a, finalColor.g * finalColor.a, duration, easing);
    this.bTween = new Tween(initialColor.b * initialColor.a, finalColor.b * finalColor.a, duration, easing);
    this.aTween = new Tween(initialColor.a, finalColor.a, duration, easing);
  }
  get currentValue() {
    let nonZeroAlpha = this.aTween.currentValue || 1;
    return new Color({
      r: Math.floor(this.rTween.currentValue / nonZeroAlpha),
      g: Math.floor(this.gTween.currentValue / nonZeroAlpha),
      b: Math.floor(this.bTween.currentValue / nonZeroAlpha),
      a: this.aTween.currentValue
    }, '');
  }
  get done() {
    return [this.rTween, this.gTween, this.bTween, this.aTween].every(tween => tween.done);
  }
}
function parseComputedColor(c) {
  let m = /^rgb\((\d+), (\d+), (\d+)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: 1,
      m
    };
  }
  m = /^rgba\((\d+), (\d+), (\d+), (\d+(?:\.\d+)?)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: parseFloat(m[4]),
      m
    };
  }
  throw new Error(`unable to parse color ${c}`);
}
function parseUserProvidedColor(c) {
  let testElement = document.createElement('div');
  testElement.style.display = 'none';
  testElement.style.color = c;
  document.body.appendChild(testElement);
  let result = parseComputedColor(getComputedStyle(testElement).color);
  testElement.remove();
  return result;
}

export { Color as C, ColorTween as a };
//# sourceMappingURL=color-GikOQVbN.js.map
