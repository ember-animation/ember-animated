import Ember from 'ember';
import layout from '../templates/components/animated-orphans';
import { task } from '../ember-scheduler';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';

export default Ember.Component.extend({
  layout,
  motionService: Ember.inject.service('-ea-motion'),
  init() {
    this._super();
    this._orphanTransitions = [];
  },
  didInsertElement() {
    this.get("motionService").registerOrphanManager(this);
  },
  willDestroyElement() {
    this.get("motionService").unregisterOrphanManager(this);
  },
  animateOrphans: task(function * (removedSprites, transition, duration) {
    this._orphanTransitions.push({ transition, duration, removedSprites });
    yield afterRender();
    if (!this.get('animate.isRunning')) {
      this.get('animate').perform();
    }
  }),

  beginStaticMeasurement() {
    // we don't have any impact on static layout
  },
  endStaticMeasurement() {},

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animate: task(function * () {
    for (let { transition, duration, removedSprites } of this._orphanTransitions) {
      let context = new TransitionContext(
        duration,
        [],
        [],
        removedSprites
      );
      context.onMotionStart = sprite => {
        if (sprite.element.parentElement) {
          throw new Error("cloning elements still in dom not implemented");
        }
        this.element.appendChild(sprite.element);
      };
      context.onMotionEnd = () => {};
      yield * context._runToCompletion(transition);
    }
  }).restartable()

});
