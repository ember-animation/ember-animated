import { Motion, rAF, Tween } from 'ember-animated';
const dimensions = ['cx', 'cy', 'r'];

export default function moveCircle(sprite, opts) {
  return new MoveCircle(sprite, opts).run();
}

export class MoveCircle extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof MoveCircle);
  }

  *animate() {
    for (let dimension of dimensions) {
      if (this.prior) {
        this[dimension] = new Tween(
          0,
          this.sprite.getFinalDimension(dimension) - this.prior[dimension].finalValue,
          this.duration,
          this.opts.easing
        ).plus(this.prior[dimension]);
      } else {
        this[dimension] = new Tween(
          this.sprite.getInitialDimension(dimension),
          this.sprite.getFinalDimension(dimension),
          this.duration,
          this.opts.easing
        );
      }
    }
    while (dimensions.find(dimension => !this[dimension].done)) {
      for (let dimension of dimensions) {
        this.sprite.element[dimension].baseVal.value = this[dimension].currentValue;
      }
      yield rAF();
    }
  }
}
