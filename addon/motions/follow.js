import { Move } from './move';
import { rAF, Tween } from '..';

export default function follow(sprite, opts) {
  return new Follow(sprite, opts).run();
}

// Because we inherit from Move, if we are interrupted by a Move the
// new Move will still preserve our momentum.
export class Follow extends Move {
  constructor(sprite, opts) {
    super(sprite, opts);
    if (!(this.opts.source instanceof Move)) {
      throw new Error("Follow requires a `source` Move to follow");
    }
  }
  * animate() {
    let source = this.opts.source;
    let sprite = this.sprite;
    let transformOffsetX = sprite.transform.tx - source.sprite.transform.tx;
    let transformOffsetY = sprite.transform.ty - source.sprite.transform.ty;
    this.xTween = new Tween(transformOffsetX, transformOffsetX, 0).plus(source.xTween);
    this.yTween = new Tween(transformOffsetY, transformOffsetY, 0).plus(source.yTween);

    // We don't need this to make our own animation work correctly,
    // but since we are a subclass of Move, and every Move requires
    // its sprite to have both initial and final bounds, we need to
    // this to remain protocol-compatible across interruptions.

    this.sprite.endRelativeTo(source.sprite);

    while (!this.xTween.done || !this.yTween.done) {
      sprite.translate(
        this.xTween.currentValue - sprite.transform.tx,
        this.yTween.currentValue - sprite.transform.ty
      );
      yield rAF();
    }
  }
}
