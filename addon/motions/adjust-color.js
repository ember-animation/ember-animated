import { Motion, rAF } from 'ember-animated';
import { Color, ColorTween } from '../color';

export default function adjustColor(propertyName, sprite, opts) {
  return new AdjustColor(propertyName, sprite, opts).run();
}

adjustColor.property = function (propertyName) {
  return this.bind(null, propertyName);
};

export class AdjustColor extends Motion {
  constructor(propertyName, sprite, opts) {
    super(sprite, opts);
    this.propertyName = propertyName;
    this.colorTween = null;
  }

  *animate() {
    let from, to;

    if (this.opts.from != null) {
      // user-provided choice takes precedence
      from = Color.fromUserProvidedColor(this.opts.from);
    } else if (this.sprite.initialComputedStyle) {
      // otherwise our initial color defaults to the measured initial style
      from = Color.fromComputedStyle(
        this.sprite.initialComputedStyle[this.propertyName],
      );
    } else {
      // if we don't have a measured initial style, we use the final
      // style. This makes sense in cases where somebody is animating
      // an insertedSprite to an explicit color, and they expect the
      // "from" value to just match the way the sprite will
      // look when it's normal.
      from = Color.fromComputedStyle(
        this.sprite.finalComputedStyle[this.propertyName],
      );
    }

    if (this.opts.to != null) {
      to = Color.fromUserProvidedColor(this.opts.to);
    } else if (this.sprite.finalComputedStyle) {
      to = Color.fromComputedStyle(
        this.sprite.finalComputedStyle[this.propertyName],
      );
    } else {
      to = Color.fromComputedStyle(
        this.sprite.initialComputedStyle[this.propertyName],
      );
    }

    this.colorTween = new ColorTween(from, to, this.duration, this.opts.easing);
    while (!this.colorTween.done) {
      this.sprite.applyStyles({
        [this.propertyName]: this.colorTween.currentValue.toString(),
      });
      yield rAF();
    }
  }
}
