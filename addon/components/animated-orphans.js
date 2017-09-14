import Ember from 'ember';
import layout from '../templates/components/animated-orphans';
import { task } from '../ember-scheduler';
import { afterRender } from '../concurrency-helpers';
import TransitionContext from '../transition-context';
import { spawnChild, childrenSettled } from '../scheduler';
import Sprite from '../sprite';

export default Ember.Component.extend({
  layout,
  classNames: ['animated-orphans'],
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
    let ownSprite = Sprite.offsetParentStartingAt(this.element);
    for (let { transition, duration, removedSprites } of this._orphanTransitions) {
      let context = new TransitionContext(
        duration,
        [],
        [],
        removedSprites
      );

      removedSprites.forEach(s => s.rehome(ownSprite));

      context.onMotionStart = this._onMotionStart.bind(this);
      context.onMotionEnd = this._onMotionEnd.bind(this);
      spawnChild(function * () {
        yield * context._runToCompletion(transition);
      });
    }
    yield childrenSettled();
    for (let { removedSprites } of this._orphanTransitions) {
      for (let sprite of removedSprites) {
        sprite.element.remove();
      }
    }
    this._orphanTransitions = [];
  }).restartable(),

  _onMotionStart(sprite) {
    if (sprite.element.parentElement) {
      throw new Error("cloning elements still in dom not implemented");
    }
    sprite.lock();
    this.element.appendChild(sprite.element);
  },

  _onMotionEnd() {}

});
