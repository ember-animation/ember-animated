import Motion from '../motion';
import Tween from '../tween';
import { task } from 'ember-concurrency';
import { rAF } from '../concurrency-helpers';

export default Motion.extend({
  animate: task(function *() {
    let element = this.sprite.element;
    let duration = this.opts.duration;
    if (this.opts.duration == null) {
      duration = 500;
    }

    let width = new Tween(this.sprite.initialBounds.width, this.sprite.finalBounds.width, duration);
    let height = new Tween(this.sprite.initialBounds.height, this.sprite.finalBounds.height, duration);

    while (!width.done) {
      yield rAF();
      element.style.width = width.currentValue + 'px';
      element.style.height = height.currentValue + 'px';
    }
  })
});
