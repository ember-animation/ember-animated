import Ember from 'ember';
import layout from '../templates/components/animated-each';
import { task } from 'ember-concurrency';
import { afterRender, rAF } from '../concurrency-helpers';
import Move from '../motions/move';
import parallel from '../parallel';
import TransitionContext from '../transition-context';

export default Ember.Component.extend({
  layout,
  tagName: '',
  motionService: Ember.inject.service('-ea-motion'),
  duration: 2000,

  init() {
    this._enteringComponents = [];
    this._currentComponents = [];
    this._leavingComponents = [];
    this._removalMotions = new Map();
    this._prevItems = [];
    this._firstTime = true;
    this.get('motionService').register(this);
    this._super();
  },

  isAnimating: Ember.computed.alias('animate.isRunning'),

  willDestroyElement() {
    let removedSprites = flatMap(this._currentComponents, component => component.sprites());
    removedSprites.forEach(sprite => sprite.measureInitialBounds());
    for (let sprite of this._removalMotions.keys()) {
      removedSprites.push(sprite);
    }
    this.get('motionService.farMatch').perform([], removedSprites);
    this.get('motionService').unregister(this);
  },

  didReceiveAttrs() {
    let prevItems = this._prevItems;
    let items = this.get('items') || [];
    this._prevItems = items.slice();

    let firstTime = this._firstTime;
    this._firstTime = false;

    if (!firstTime) {
      this._notifyContainer('lock');
    }

    let currentSprites = flatMap(this._currentComponents, component => component.sprites());
    currentSprites.forEach(sprite => sprite.measureInitialBounds());
    currentSprites.forEach(sprite => sprite.lock());
    this.get('animate').perform(prevItems, items, currentSprites, firstTime);
  },

  animate: task(function * (prevItems, items, currentSprites, firstTime) {
    yield afterRender();

    let [keptSprites, removedSprites] = partition(
      currentSprites,
      sprite => this._leavingComponents.indexOf(sprite.component) < 0
    );

    for (let sprite of this._removalMotions.keys()) {
      removedSprites.push(sprite);
    }

    // Briefly unlock everybody
    keptSprites.forEach(sprite => sprite.unlock());
    // so we can measure the final static layout
    let insertedSprites = flatMap(this._enteringComponents, component => component.sprites());
    insertedSprites.forEach(sprite => sprite.measureFinalBounds());
    keptSprites.forEach(sprite => sprite.measureFinalBounds());
    this._notifyContainer('measure', { duration: this.get('duration') });

    // Update our permanent state so that if we're interrupted after
    // this point we are already consistent. AFAIK, we can't be
    // interrupted before this point because Ember won't fire
    // `didReceiveAttrs` multiple times before `afterRender` happens.
    this._updateComponentLists();

    // Then lock everything down
    keptSprites.forEach(sprite => sprite.lock());
    insertedSprites.forEach(sprite => sprite.lock());

    let farMatches = yield this.get('motionService.farMatch').perform(insertedSprites, removedSprites);

    // any removed sprites that matched elsewhere will get handled elsewhere
    removedSprites = removedSprites.filter(sprite => !farMatches.get(sprite))

    let transition;
    if (firstTime) {
      transition = defaultFirstTransition;
    } else {
      transition = defaultTransition;
    }

    for (let motions of transition.call(new TransitionContext(insertedSprites, keptSprites, removedSprites, farMatches), this.get('duration'))) {
      if (!Array.isArray(motions)) {
        motions = [motions];
      }
      yield * parallel(motions.map(m => this._runMotion(m, insertedSprites, removedSprites)), onError);
    }

    keptSprites.forEach(sprite => sprite.unlock());
    insertedSprites.forEach(sprite => {
      sprite.unlock();
      sprite.reveal(); // inserted sprites get revealed when their
                       // first motion begins. If they didn't get any
                       // motions, we have a catch-all here.
    });
    this._notifyContainer('unlock');
  }).restartable(),

  _runMotion(motion, insertedSprites, removedSprites) {
    if (removedSprites.indexOf(motion.sprite) !== -1) {
      return this._runWithRemoval(motion);
    }
    if (insertedSprites.indexOf(motion.sprite) !== -1) {
      motion.sprite.reveal();
    }
    return motion.run();
  },

  * _runWithRemoval(motion) {
    let motionCounts = this._removalMotions;
    let count = motionCounts.get(motion.sprite) || 0;
    if (count === 0) {
      motion.sprite.append();
      motion.sprite.lock();
    }
    count++;
    motionCounts.set(motion.sprite, count);
    try {
      yield * motion.run();
    } finally {
      rAF().then(() => {
        let count = motionCounts.get(motion.sprite);
        if (count > 1) {
          motionCounts.set(motion.sprite, --count);
        } else {
          motion.sprite.remove();
          motionCounts.delete(motion.sprite)
        }
      });
    }
  },

  _updateComponentLists() {
    this._currentComponents = this._currentComponents.concat(this._enteringComponents)
      .filter(c => this._leavingComponents.indexOf(c) === -1);
    this._enteringComponents = [];
    this._leavingComponents = [];
  },

  _notifyContainer(method, opts) {
    var target = this.get('notify');
    if (target && target[method]) {
      return target[method](opts);
    }
  },

  actions: {
    childEntering(component) {
      this._enteringComponents.push(component);
    },
    childLeaving(component) {
      this._leavingComponents.push(component);
    }
  }

}).reopenClass({
  positionalParams: ['items']
});


function partition(list, pred) {
  let matched = [];
  let unmatched = [];
  list.forEach(entry => {
    if (pred(entry)) {
      matched.push(entry);
    } else {
      unmatched.push(entry);
    }
  });
  return [matched, unmatched];
}

function flatMap(list, fn) {
  let results = [];
  for (let i = 0; i < list.length; i++) {
    results.push(fn(list[i]));
  }
  return [].concat(...results);
}

function onError(reason) {
  if (reason.name !== 'TaskCancelation') {
    setTimeout(function() {
      throw reason;
    }, 0);
  }
}


function * defaultFirstTransition(duration) {
  let motions = [];

  this.insertedSprites.forEach(sprite => {
    let oldSprite = this.matchFor(sprite);
    if (oldSprite) {
      sprite.startAt(oldSprite);
      motions.push(new Move(sprite, { duration }));
    }
  });

  yield motions;
}

function * defaultTransition(duration) {
  let motions = [];

  this.insertedSprites.forEach(sprite => {
    let oldSprite = this.matchFor(sprite);
    if (oldSprite) {
      sprite.startAt(oldSprite);
      motions.push(new Move(sprite, { duration }));
    } else {
      sprite.startTranslatedBy(1000, 0);
      motions.push(new Move(sprite, { duration }));
    }
  });

  this.keptSprites.forEach(sprite => {
    motions.push(new Move(sprite, { duration }));
  });

  this.removedSprites.forEach(sprite => {
    sprite.endTranslatedBy(1000, 0);
    motions.push(new Move(sprite, { duration }));
  });

  yield motions;
}
