import Ember from 'ember';
import Resize from '../motions/resize';
import { task } from '../ember-scheduler';
import Sprite from '../sprite';
import { emptyBounds } from '../bounds';
import { afterRender } from '../concurrency-helpers';

export default Ember.Component.extend({
  classNames: ['animated-container'],
  motionService: Ember.inject.service('-ea-motion'),
  onInitialRender: false,

  init() {
    this._super();
    this._signals = null;
    this._signalPromise = null;
    this._signalResolve= null;
    this._inserted = false;
    this._startingUp = false;
    this.get('motionService').register(this);
  },

  didInsertElement() {
    this._inserted = true;
  },

  willDestroyElement() {
    this.get('motionService').unregister(this);
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animationStarting({ duration, task }) {
    if (!this._startingUp) {
      this.get('animate').perform(duration, task);
    }
  },

  beginStaticMeasurement() {
    if (this.sprite) {
      this.sprite.unlock();
    }
  },

  endStaticMeasurement() {
    if (this.sprite) {
      this.sprite.lock();
    }
  },

  animate: task(function * (duration, animationTask) {
    this._startingUp = true;
    let service = this.get('motionService');
    let sprite;
    let useMotion;

    if (this._inserted){
      sprite = Sprite.sizedStartingAt(this.element);
      this.sprite = sprite;
      sprite.lock();
      useMotion = true;
    } else {
      useMotion = this.get('onInitialRender');
    }

    try {
      yield afterRender();
    } finally {
      this._startingUp = false;
    }

    yield * service.staticMeasurement(() => {
      if (!sprite) {
        sprite = Sprite.sizedEndingAt(this.element);
        this.sprite = sprite;
        sprite.initialBounds = emptyBounds;
      } else {
        sprite.measureFinalBounds();
      }
    });

    if (useMotion) {
      yield* new (this.motion || Resize)(this.sprite, { duration })._run();
    }

    yield animationTask;

    this.sprite.unlock();
    this.sprite = null;
  }).restartable()
});
