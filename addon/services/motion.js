import { DEBUG } from '@glimmer/env';
import Ember from 'ember';
import { task } from '../ember-scheduler';
import { microwait, rAF, afterRender, allSettled } from '../concurrency-helpers';

const MotionService = Ember.Service.extend({
  init() {
    this._super();
    this._rendezvous = [];
    this._measurements = [];
    this._animators = Ember.A();
    this._orphanObserver = null;
    this._animationObservers = [];
    this._descendantObservers = [];
    this._ancestorObservers = new WeakMap();
    this._matchingAnimatorsFinished = null;
  },

  // === Notification System ===

  // Ever animator should register and unregister itself so we know
  // when there are any animations running. Animators are required to
  // have:
  //    - an isAnimating property
  //    - beginStaticMeasurement and endStaticMeasurement methods
  register(animator) {
    this._animators.pushObject(animator);
    return this;
  },
  unregister(animator) {
    this._animators.removeObject(animator);
    return this;
  },

  // Register to receive any sprites that are orphaned by a destroyed
  // animator.
  observeOrphans(fn) {
    if (this._orphanObserver) {
      throw new Error("Only one animated-orphans component can be used at one time");
    }
    this._orphanObserver = fn;
    return this;
  },
  unobserveOrphans(fn) {
    if (this._orphanObserver === fn) {
      this._orphanObserver = null;
    }
    return this;
  },

  // Register to know when an animation is starting anywhere in the app.
  observeAnimations(fn) {
    this._animationObservers.push(fn);
    return this;
  },
  unobserveAnimations(fn) {
    let index = this._animationObservers.indexOf(fn);
    if (index !== -1) {
      this._animationObservers.splice(fn, 1);
    }
    return this;
  },

  // Register to know when an animation is starting within the
  // descendants of the given component
  observeDescendantAnimations(component, fn) {
    this._descendantObservers.push({ component, fn });
    return this;
  },
  unobserveDescendantAnimations(component, fn) {
    let index = this._descendantObservers.find(e => e.component === component && e.fn === fn);
    if (index !== -1) {
      this._descendantObservers.splice(fn, 1);
    }
    return this;
  },

  // Register to know when an animation is starting among the
  // ancestors of the given comoponent. The fn will be told whether
  // component is going to be destroyed or not at the end of the
  // animation.
  observeAncestorAnimations(component, fn) {
    let id;
    for (let ancestorComponent of ancestorsOf(component)) {
      // when we find an animated list element, we save its ID
      if (ancestorComponent.isEmberAnimatedListElement) {
        id = ancestorComponent.get('child.id');
      } else if (id != null) {
        // if we found an ID on the last loop, now we've got the list
        // element's parent which is the actual animator.
        let observers = this._ancestorObservers.get(ancestorComponent);
        if (!observers) {
          this._ancestorObservers.set(ancestorComponent, observers = new Map());
        }
        observers.set(fn, id);
        id = null;
      }
    }
    return this;
  },
  unobserveAncestorAnimations(component, fn){
    for (let ancestorComponent of ancestorsOf(component)) {
      let observers = this._ancestorObservers.get(ancestorComponent);
      if (observers) {
        observers.delete(fn);
      }
    }
    return this;
  },

  // This is a publicly visible property you can use to know if any
  // animations are running. It's timing is deliberately not
  // synchronous, so that you can bind it into a template without
  // getting double-render errors.
  isAnimating: Ember.computed(function () {
    return this.get('isAnimatingSync');
  }),

  // Synchronously updated version of isAnimating. If you try to
  // depend on this in a template you will get double-render errors
  // (because the act of rendering can cause animations to begin).
  isAnimatingSync: Ember.computed('_animators.@each.isAnimating', function() {
    return this.get('_animators').any(animator => animator.get('isAnimating'));
  }),

  // Invalidation support for isAnimating
  _invalidateIsAnimating: task(function * () {
    yield rAF();
    this.propertyDidChange('isAnimating');
  }).observes('isAnimatingSync'),

  waitUntilIdle: task(function * () {
    // we are idle if we experience two frames in a row with nothing
    // animating.
    while (true) {
      yield rAF();
      if (!this.get('isAnimatingSync')) {
        yield rAF();
        if (!this.get('isAnimatingSync')) {
          return;
        }
      }
    }
  }),

  matchDestroyed(removed, transition, duration) {
    if (this._orphanObserver && transition && removed.length > 0) {
      // if these orphaned sprites may be capable of animating,
      // delegate them to the orphanObserver. It will do farMatching
      // for them.
      this._orphanObserver(removed, transition, duration);
    } else {
      // otherwise, we make them available for far matching but they
      // can't be animated.
      this.get('farMatch').perform(null, [], [], removed, true);
    }
  },

  farMatch: task(function * (runAnimationTask, inserted, kept, removed, longWait=false) {
    let matches = new Map();
    let mine = { inserted, kept, removed, matches, runAnimationTask };
    this._rendezvous.push(mine);
    if (this.get('farMatch.concurrency') === 1) {
      this._matchingAnimatorsFinished = null;
    }
    yield microwait();
    if (longWait) {
      // used by matchDestroyed because it gets called earlier in the
      // render cycle, so it needs to linger longer in order to
      // coincide with other farMatches.
      yield afterRender();
      yield microwait();
    }

    if (this.get('farMatch.concurrency') > 1) {
      if (!this._matchingAnimatorsFinished) {
        this._matchingAnimatorsFinished = allSettled(this._rendezvous.map(r => r.runAnimationTask));
      }
      this._rendezvous.forEach(target => {
        if (target === mine) { return; }
        performMatches(mine, target);
        performMatches(target, mine);
      });
    }
    this._rendezvous.splice(this._rendezvous.indexOf(mine), 1);
    if (this.get('farMatch.concurrency') === 1) {
      this._matchingAnimatorsFinished = null;
    }
    return { farMatches: matches, matchingAnimatorsFinished: this._matchingAnimatorsFinished };
  }),

  willAnimate({ task, duration, component, children }) {
    let message = { task, duration };

    // tell any of our ancestors who are observing their descendants
    let ancestors = [...ancestorsOf(component)];
    for (let { component: observingComponent, fn } of this._descendantObservers) {
      if (ancestors.indexOf(observingComponent) !== -1) {
        fn(message);
      }
    }

    // tell any of our descendants who are observing their ancestors
    let observers = this._ancestorObservers.get(component);
    if (observers) {
      for (let [fn, id] of observers.entries()) {
        let child = children.find(child => child.id === id);
        fn(child.state);
      }
    }

    // tell anybody who is listenign for all animations
    for (let fn of this._animationObservers) {
      fn(message);
    }
  },

  staticMeasurement: function * (fn) {
    let measurement = { fn, resolved: false, value: null };
    this._measurements.push(measurement);
    try {
      // allow all concurrent animators to join in with our single
      // measurement step instead of having each trigger its own reflow.
      yield microwait();

      if (!measurement.resolved) {
        // we are the first concurrent task to wake up, so we do the
        // actual resolution for everyone.
        let animators = this.get('_animators');
        animators.forEach(animator => animator.beginStaticMeasurement());
        this._measurements.forEach(m => {
          try {
            m.value = m.fn();
          } catch(err) {
            setTimeout(function() { throw err; }, 0);
          }
          m.resolved = true;
        });
        animators.forEach(animator => animator.endStaticMeasurement());
      }
      return measurement.value;
    } finally {
      this._measurements.splice(this._measurements.indexOf(measurement), 1);
    }
  }

});

function performMatches(sink, source) {
  sink.inserted.concat(sink.kept).forEach(sprite => {
    let match = source.removed.find(mySprite => sprite.owner.id === mySprite.owner.id);
    if (match) {
      sink.matches.set(sprite, match);
      source.matches.set(match, sprite);
    }
  });
}

function * ancestorsOf(component) {
  let pointer = component.parentView;
  while (pointer) {
    yield pointer;
    pointer = pointer.parentView;
  }
}

if (DEBUG) {
  let idleFrames = 0;
  const isIdle = function() {
    return idleFrames > 2;
  };

  MotionService.reopen({
    init() {
      this._super(...arguments);
      if (Ember.testing) {
        Ember.Test.registerWaiter(isIdle);
      }
      this.get('idlePoller').perform();
    },

    willDestroy() {
      if (Ember.testing) {
        Ember.Test.unregisterWaiter(isIdle);
      }
      this._super(...arguments);
    },

    idlePoller: task(function * () {
      while (true) {
        yield rAF();
        if (this.get('isAnimatingSync')) {
          idleFrames = 0;
        } else {
          idleFrames++;
        }
      }
    })
  });
}

export default MotionService;
