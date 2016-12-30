import Ember from 'ember';
import { task } from 'ember-concurrency';
import { microwait, rAF } from '../concurrency-helpers';

export default Ember.Service.extend({
  init() {
    this._super();
    this._rendezvous = [];
    this._measurements = [];
    this._animators = Ember.A();
  },
  register(animator) {
    this._animators.pushObject(animator);
  },
  unregister(animator) {
    this._animators.removeObject(animator);
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

  matchDestroyed(removed) {
    this.get('farMatch').perform([], removed, true);
  },

  farMatch: task(function * (inserted, removed, longWait=false) {
    let matches = new Map();
    let mine = { inserted, removed, matches };
    this._rendezvous.push(mine);
    yield microwait();
    if (longWait) {
      // used by matchDestroyed because it gets called earlier in the
      // render cycle, so it needs to linger longer in order to
      // coincide with other farMatches.
      yield microwait();
    }

    if (this.get('farMatch.concurrency') > 1) {
      this._rendezvous.forEach(target => {
        if (target === mine) { return; }
        performMatches(mine, target);
        performMatches(target, mine);
      });
    }
    this._rendezvous.splice(this._rendezvous.indexOf(mine), 1);
    return matches;
  }),

  willAnimate(message) {
    // TODO narrow down the messaging based on DOM containment.
    this.get('_animators').forEach(listener => {
      if (listener.animationStarting) {
        listener.animationStarting(message);
      }
    });
  },

  staticMeasurement: function * (fn) {
    let measurement = { fn, resolved: false, value: null };
    this._measurements.push(measurement);

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

    this._measurements.splice(this._measurements.indexOf(measurement), 1);

    return measurement.value;
  }

});

function performMatches(insertedSource, removedSource) {
  insertedSource.inserted.slice().forEach(sprite => {
    let match = removedSource.removed.find(mySprite => sprite.owner.id === mySprite.owner.id);
    if (match) {
      insertedSource.matches.set(sprite, match);
      removedSource.matches.set(match, sprite);
    }
  });

}
