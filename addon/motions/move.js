import Motion from '../motion';
import Tween from '../tween';
import { task } from 'ember-concurrency';
import { rAF } from '../concurrency-helpers';


export default Motion.extend({
  animate: task(function *() {
    let duration = this.opts.duration == null ? 1000 : this.opts.duration;
    let sprite = this.sprite;
    let initial = sprite.initialBounds;
    let final = sprite.finalBounds;

    let x = new Tween(
      sprite.transform.tx,
      sprite.transform.tx + final.left - initial.left,
      duration
    );

    let y = new Tween(
      sprite.transform.ty,
      sprite.transform.ty + final.top - initial.top,
      duration
    );

    sprite.reveal();
    while (!x.done) {
      yield rAF();
      sprite.translate(
        x.currentValue - sprite.transform.tx,
        y.currentValue - sprite.transform.ty
      );
    }
  })
});
