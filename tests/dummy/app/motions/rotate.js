import { Motion, rAF, Tween } from 'ember-animated';
import linear from 'ember-animated/easings/linear';

export default function rotateTo(sprite, opts) {
  return new RotateTo(sprite, opts).run();
}

export class RotateTo extends Motion {
  * animate() {
    let { sprite, duration } = this;
    let direction = this.opts.direction;

    // This assumes no scaling or skew
    let initialRotation = Math.acos(sprite.initialCumulativeTransform.a);

    let finalRotation = Math.acos(sprite.finalCumulativeTransform.a);

    console.log(initialRotation, finalRotation);

    while (direction*finalRotation > direction*initialRotation) {
       finalRotation -= direction * Math.PI * 2;
    }

    let tween = new Tween(initialRotation, finalRotation, duration, linear);

    while (!tween.done) {
      sprite.applyStyles({
        transformOrigin: '50% 50%',
        transform: `translateX(${sprite.transform.tx}px) translateY(${sprite.transform.ty}px) rotate(${tween.currentValue}rad)`
      });
      yield rAF();
    }
  }
}
