import Motion from '../motion';
import { task } from 'ember-concurrency';
import { rAF } from '../concurrency-helpers';

function ease(p) {
  return 0.5 - Math.cos( p * Math.PI ) / 2;
}

export default Motion.extend({
  animate: task(function *() {
    // Taking a queue from velocity, we don't directly use the rAF
    // high resolution timestamps because of the way they get off
    // under stress.
    let startTime = (new Date()).getTime();
    let duration = this.opts.duration;
    if (duration == null) {
      duration = 1000;
    }
    let runTime = 0;

    let initialX = this.sprite.transform.tx;
    let initialY = this.sprite.transform.ty;
    let dx = this.sprite.finalBounds.left - this.sprite.initialBounds.left;
    let dy = this.sprite.finalBounds.top - this.sprite.initialBounds.top;

    while (runTime < duration) {
      this.sprite.reveal();
      yield rAF();
      runTime = (new Date()).getTime() - startTime;
      let fraction = runTime / duration;
      let eased = ease(fraction);
      let newX = initialX + dx * eased;
      let newY = initialY + dy * eased;
      this.sprite.translate(newX - this.sprite.transform.tx, newY - this.sprite.transform.ty);
    }
  })
});
