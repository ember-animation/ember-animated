import { Motion, rAF } from '..';
import Tween from '../tween';

export default function scale(sprite, opts) {
  return new Scale(sprite, opts).run();
}

export class Scale extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.widthTween = null;
    this.heightTween = null;
  }

  * animate() {
    let sprite = this.sprite;
    let duration = this.duration;

    let widthFactor = sprite.finalBounds.width / sprite.initialBounds.width;
    let heightFactor = sprite.finalBounds.height / sprite.initialBounds.height;

    this.widthTween = new Tween(sprite.transform.a, sprite.transform.a * widthFactor, duration);
    this.heightTween = new Tween(sprite.transform.d, sprite.transform.d * heightFactor, duration);

    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.scale(this.widthTween.currentValue / sprite.transform.a, this.heightTween.currentValue / sprite.transform.d);
      yield rAF();
    }
  }
}
