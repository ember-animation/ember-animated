import { Tween } from '.';
import linear from  './easings/linear';

// We use Element.remove in our color parser below.
import './element-remove';

export class Color {
  static fromComputedStyle(colorString) {
    return new Color(parseComputedColor(colorString));
  }
  static fromUserProvidedColor(colorString) {
    return new Color(parseUserProvidedColor(colorString));
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  constructor({ r, g, b, a }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

export class ColorTween {
  constructor(initialColor, finalColor, duration, easing=linear) {
    this.rTween = new Tween(initialColor.r * initialColor.a, finalColor.r * finalColor.a, duration, easing);
    this.gTween = new Tween(initialColor.g * initialColor.a, finalColor.g * finalColor.a, duration, easing);
    this.bTween = new Tween(initialColor.b * initialColor.a, finalColor.b * finalColor.a, duration, easing);
    this.aTween = new Tween(initialColor.a, finalColor.a, duration, easing);
  }
  get currentValue() {
    let currentAlpha = this.aTween.currentValue || 1;
    return new Color({
      r: Math.floor(this.rTween.currentValue / currentAlpha),
      g: Math.floor(this.gTween.currentValue / currentAlpha),
      b: Math.floor(this.bTween.currentValue / currentAlpha),
      a: currentAlpha,
    });
  }
  get done() {
    return [this.rTween, this.gTween, this.bTween, this.aTween].every(tween => tween.done);
  }
}

function parseComputedColor(c) {
  let m = /rgb\((\d+), (\d+), (\d+)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: 1
    };
  }
  m = /rgba\((\d+), (\d+), (\d+), (\d+(?:\.\d+)?)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: parseFloat(m[4])
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
