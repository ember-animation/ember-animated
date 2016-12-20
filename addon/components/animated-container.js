import Ember from 'ember';
import layout from '../templates/components/animated-container';
import Resize from '../motions/resize';
import { task } from 'ember-concurrency';
import { Promise } from '../concurrency-helpers';
import { ContainerSprite } from '../sprite';
import { collapsedMargin } from '../margin-collapse';

export default Ember.Component.extend({
  layout,
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

  animate: task(function * (useMotion) {
    let opts = yield* this.waitForSignal('measured');
    if (useMotion) {
      yield* new (this.motion || Resize)(this.sprite, opts)._run();
    }
    yield* this.waitForSignal('unlock');
    this.sprite.unlock();
  }).restartable(),

  resetSignals() {
    this._signals = [];
  },

  receivedSignal(name, opts) {
    if (!this._signals) { return; }
    this._signals.push({name, opts});
    let s = this._signalResolve;
    this._signalResolve = null;
    this._signalPromise = null;
    if (s) {
      s();
    }
  },

  waitForSignal: function * (name) {
    let signal;
    while (!(signal = this._signals.find(s => s.name === name))) {
      if (!this._signalPromise) {
        this._signalPromise = new Promise(resolve => {
          this._signalResolve = resolve;
        });
      }
      yield this._signalPromise;
    }
    return signal.opts;
  },

  actions: {
    lock() {
      if (!this._inserted){ return; }
      let sprite = new ContainerSprite(this.element);
      this.sprite = sprite;
      this.resetSignals();
      sprite.measureInitialBounds();
      sprite.lock();
      handleMarginCollapse(sprite);
      this.get('animate').perform(true);
    },
    measure(opts) {
      if (this.sprite) {
        this.sprite.unlock();
        this.sprite.measureFinalBounds();
        this.sprite.lock();
      } else {
        let sprite = new ContainerSprite(this.element);
        this.sprite = sprite;
        this.resetSignals();
        sprite.measureFinalBounds();
        sprite.initialBounds = { width: 0, height: 0 };
        sprite.lock();
        this.get('animate').perform(this.get('onInitialRender'));
      }
      this.receivedSignal('measured', opts);
    },
    unlock() {
      this.receivedSignal('unlock');
    }
  }
});

function handleMarginCollapse(sprite) {
  let element = sprite.element;
  let cs = getComputedStyle(element);
  let marginTop = collapsedMargin(element, cs, 'Top');
  let marginBottom = collapsedMargin(element, cs, 'Bottom');
  sprite.applyStyles({
    marginTop: marginTop + 'px',
    marginBottom: marginBottom + 'px'
  });
}
