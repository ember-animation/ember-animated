import Ember from 'ember';
import Resize from '../motions/resize';
import { task } from 'ember-concurrency';
import Sprite from '../sprite';

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
    this.get('motionService').register(this);
  },

  didInsertElement() {
    this._inserted = true;
  },

  willDestroyElement() {
    this.get('motionService').unregister(this);
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

  animationStarting(message) {
    let { duration, task } = message;
    this.get('animate').perform(duration, task);
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

    yield * service.staticMeasurement(() => {
      if (!sprite) {
        sprite = Sprite.sizedEndingAt(this.element);
        this.sprite = sprite;
        sprite.initialBounds = { width: 0, height: 0 };
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
