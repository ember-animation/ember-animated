import Ember from 'ember';
import layout from '../templates/components/animated-container';
import Resize from '../motions/resize';
import { task } from 'ember-concurrency';
import { Promise } from '../concurrency-helpers';
import Sprite from '../sprite';

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
      let sprite = new Sprite(this.element, this, true);
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
        let sprite = new Sprite(this.element, this, true);
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

  if (cs.borderTopWidth === '0px' && cs.paddingTop === '0px') {
    // our first child block's top margin may be collapsing with our own.
    let marginTop = parseFloat(cs.marginTop);
    for (let i = 0; i < element.children.length; i++) {
      let child = element.children[i];
      let childCS = getComputedStyle(child);
      if (childCS.display === 'block' && (childCS.position === 'static' || childCS.position === 'relative')) {
        // we found the first child block
        let childMarginTop = parseFloat(childCS.marginTop);
        if (childMarginTop > marginTop) {
          sprite.applyStyles({
            marginTop: childMarginTop + 'px'
          });
        }
        break;
      }
    }
  }

  if (cs.borderBottomWidth === '0px' && cs.paddingBottom === '0px') {
    // our last child block's bottom margin may be collapsing with our own.
    let marginBottom = parseFloat(cs.marginBottom);
    for (let i = element.children.length - 1; i >= 0; i--) {
      let child = element.children[i];
      let childCS = getComputedStyle(child);
      if (childCS.display === 'block' && (childCS.position === 'static' || childCS.position === 'relative')) {
        // we found the first child block
        let childMarginBottom = parseFloat(childCS.marginBottom);
        if (childMarginBottom > marginBottom) {
          sprite.applyStyles({
            marginBottom: childMarginBottom + 'px'
          });
        }
        break;
      }
    }
  }
}
