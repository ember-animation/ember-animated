import { Motion, rAF, Tween } from 'ember-animated';

export default function moveSVG(dimension, sprite, opts) {
  return new MoveSVG(dimension, sprite, opts).run();
}

moveSVG.property = function (propertyName) {
  return this.bind(null, propertyName);
};

export class MoveSVG extends Motion {
  constructor(dimension, sprite, opts) {
    super(sprite, opts);
    this.dimension = dimension;
    this.prior = null;
    this.tween = null;
  }

  interrupted(motions) {
    this.prior = motions.find(
      (m) => m instanceof MoveSVG && m.dimension === this.dimension,
    );
  }

  *animate() {
    if (this.prior) {
      this.tween = new Tween(
        0,
        this.sprite.getFinalDimension(this.dimension) -
          this.prior.tween.finalValue,
        this.duration,
        this.opts.easing,
      ).plus(this.prior.tween);
    } else {
      this.tween = new Tween(
        this.sprite.getInitialDimension(this.dimension),
        this.sprite.getFinalDimension(this.dimension),
        this.duration,
        this.opts.easing,
      );
    }
    while (!this.tween.done) {
      this.sprite.element[this.dimension].baseVal.value =
        this.tween.currentValue;
      yield rAF();
    }
  }
}
