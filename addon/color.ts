import { Tween } from '.';
import linear from './easings/linear';

// We use Element.remove in our color parser below.
import './element-remove';

export class Color {
  static fromComputedStyle(colorString: string) {
    let channels = parseComputedColor(colorString);
    return new Color(channels, channels.m[0]);
  }
  static fromUserProvidedColor(colorString: string) {
    return new Color(parseUserProvidedColor(colorString), colorString);
  }

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(
    { r, g, b, a }: { r: number; g: number; b: number; a: number },
    readonly sourceString: string,
  ) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

export class ColorTween {
  private rTween: Tween;
  private gTween: Tween;
  private bTween: Tween;
  private aTween: Tween;

  constructor(
    initialColor: Color,
    finalColor: Color,
    duration: number,
    easing: (time: number) => number = linear,
  ) {
    this.rTween = new Tween(
      initialColor.r * initialColor.a,
      finalColor.r * finalColor.a,
      duration,
      easing,
    );
    this.gTween = new Tween(
      initialColor.g * initialColor.a,
      finalColor.g * finalColor.a,
      duration,
      easing,
    );
    this.bTween = new Tween(
      initialColor.b * initialColor.a,
      finalColor.b * finalColor.a,
      duration,
      easing,
    );
    this.aTween = new Tween(initialColor.a, finalColor.a, duration, easing);
  }
  get currentValue() {
    let nonZeroAlpha = this.aTween.currentValue || 1;
    return new Color(
      {
        r: Math.floor(this.rTween.currentValue / nonZeroAlpha),
        g: Math.floor(this.gTween.currentValue / nonZeroAlpha),
        b: Math.floor(this.bTween.currentValue / nonZeroAlpha),
        a: this.aTween.currentValue,
      },
      '',
    );
  }
  get done() {
    return [this.rTween, this.gTween, this.bTween, this.aTween].every(
      (tween) => tween.done,
    );
  }
}

function parseComputedColor(c: string) {
  let m = /^rgb\((\d+), (\d+), (\d+)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: 1,
      m,
    };
  }
  m = /^rgba\((\d+), (\d+), (\d+), (\d+(?:\.\d+)?)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: parseFloat(m[4]),
      m,
    };
  }
  throw new Error(`unable to parse color ${c}`);
}

function parseUserProvidedColor(c: string) {
  let testElement = document.createElement('div');
  testElement.style.display = 'none';
  testElement.style.color = c;
  document.body.appendChild(testElement);
  let result = parseComputedColor(getComputedStyle(testElement).color!);
  testElement.remove();
  return result;
}
