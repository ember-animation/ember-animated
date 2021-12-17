import { Color, ColorTween } from './color';
import { Tween } from '.';
import linear from './easings/linear';
import './element-remove';

const innerPattern =
  /^ (\d+)px (\d+)px(?: (\d+)px)?(?: (\d+)px)?( inset)?(?:, )?/;

export class BoxShadow {
  static fromComputedStyle(string: string) {
    let originalString = string;
    let shadows: BoxShadow[] = [];
    if (!string || string === 'none') {
      return shadows;
    }
    while (string.length > 0) {
      let color = Color.fromComputedStyle(string);
      string = string.slice(color.sourceString.length);
      let m = innerPattern.exec(string);
      if (!m) {
        throw new Error(`failed to parse computed shadow ${originalString}`);
      }
      let x = parseInt(m[1]);
      let y = parseInt(m[2]);
      let blur = m[3] == null ? 0 : parseInt(m[3]);
      let spread = m[4] == null ? 0 : parseInt(m[4]);
      let inset = m[5] != null;
      shadows.push(new BoxShadow({ color, x, y, blur, spread, inset }));
      string = string.slice(m[0].length);
    }
    return shadows;
  }

  static fromUserProvidedShadow(string: string) {
    let testElement = document.createElement('div');
    testElement.style.display = 'none';
    testElement.style.boxShadow = string;
    document.body.appendChild(testElement);
    let result = this.fromComputedStyle(
      getComputedStyle(testElement).boxShadow!,
    );
    testElement.remove();
    return result;
  }

  readonly color: Color;
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly inset: boolean;

  constructor({
    color,
    x,
    y,
    blur,
    spread,
    inset,
  }: {
    color: Color;
    x: number;
    y: number;
    blur: number;
    spread: number;
    inset: boolean;
  }) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.blur = blur;
    this.spread = spread;
    this.inset = inset;
  }

  toString() {
    return `${this.inset ? 'inset ' : ''}${this.x}px ${this.y}px ${
      this.blur
    }px ${this.spread}px ${this.color.toString()}`;
  }
}

function emptyShadowOfType(otherShadow: BoxShadow) {
  return new BoxShadow({
    color: Color.fromComputedStyle('rgba(0, 0, 0, 0)'),
    blur: 0,
    spread: 0,
    x: 0,
    y: 0,
    inset: otherShadow.inset,
  });
}

export class BoxShadowTween {
  private shadowTweens: OneShadowTween[];

  constructor(
    fromShadows: BoxShadow[],
    toShadows: BoxShadow[],
    duration: number,
    easing: (time: number) => number = linear,
  ) {
    let shadowCount = Math.max(fromShadows.length, toShadows.length);
    if (fromShadows.length < shadowCount) {
      fromShadows = fromShadows.slice();
      while (fromShadows.length < shadowCount) {
        fromShadows.push(emptyShadowOfType(toShadows[fromShadows.length]));
      }
    }
    if (toShadows.length < shadowCount) {
      toShadows = toShadows.slice();
      while (toShadows.length < shadowCount) {
        toShadows.push(emptyShadowOfType(fromShadows[toShadows.length]));
      }
    }

    this.shadowTweens = fromShadows.map(
      (fromShadow, index) =>
        new OneShadowTween(fromShadow, toShadows[index], duration, easing),
    );
  }
  get currentValue() {
    return this.shadowTweens.map((tween) => tween.currentValue);
  }
  get done() {
    return this.shadowTweens.every((tween) => tween.done);
  }
}

class OneShadowTween {
  private colorTween: ColorTween;
  private xTween: Tween;
  private yTween: Tween;
  private blurTween: Tween;
  private spreadTween: Tween;
  private inset: boolean;

  constructor(
    fromShadow: BoxShadow,
    toShadow: BoxShadow,
    duration: number,
    easing: (time: number) => number,
  ) {
    this.colorTween = new ColorTween(
      fromShadow.color,
      toShadow.color,
      duration,
      easing,
    );
    this.xTween = new Tween(fromShadow.x, toShadow.x, duration, easing);
    this.yTween = new Tween(fromShadow.y, toShadow.y, duration, easing);
    this.blurTween = new Tween(
      fromShadow.blur,
      toShadow.blur,
      duration,
      easing,
    );
    this.spreadTween = new Tween(
      fromShadow.spread,
      toShadow.spread,
      duration,
      easing,
    );
    this.inset = fromShadow.inset;
  }

  get currentValue() {
    return new BoxShadow({
      x: this.xTween.currentValue,
      y: this.yTween.currentValue,
      blur: this.blurTween.currentValue,
      spread: this.spreadTween.currentValue,
      inset: this.inset,
      color: this.colorTween.currentValue,
    });
  }

  get done() {
    return [
      this.colorTween,
      this.xTween,
      this.yTween,
      this.blurTween,
      this.spreadTween,
    ].every((tween) => tween.done);
  }
}
