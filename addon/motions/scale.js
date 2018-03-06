import { Motion, rAF, Tween } from '..';

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

    let initialWidthFactor, initialHeightFactor;

    if (sprite.originalInitialBounds) {
      // the sprite is going to start at its own native initial size,
      // which may differ from the initialBounds.width &
      // initialBounds.height that have been set for it. This
      // compensates with an initial scaling.
      initialWidthFactor =  sprite.initialBounds.width / sprite.originalInitialBounds.width;
      initialHeightFactor =  sprite.initialBounds.height / sprite.originalInitialBounds.height;
    } else  {
      // the sprite is going to start at its own native final size
      initialWidthFactor =  sprite.initialBounds.width / sprite.originalFinalBounds.width;
      initialHeightFactor =  sprite.initialBounds.height / sprite.originalFinalBounds.height;
    }

    let widthFactor = sprite.finalBounds.width / sprite.initialBounds.width;
    let heightFactor = sprite.finalBounds.height / sprite.initialBounds.height;

    this.widthTween = new Tween(sprite.transform.a * initialWidthFactor, sprite.transform.a * initialWidthFactor * widthFactor, duration);
    this.heightTween = new Tween(sprite.transform.d * initialHeightFactor, sprite.transform.d * initialHeightFactor * heightFactor, duration);

    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.scale(this.widthTween.currentValue / sprite.transform.a, this.heightTween.currentValue / sprite.transform.d);
      yield rAF();
    }
  }
}
