import Ember from 'ember';
import layout from '../templates/components/animated-each';
import { task } from 'ember-concurrency';
import { afterRender } from '../concurrency-helpers';
import Move from '../motions/move';
import parallel from '../parallel';

export default Ember.Component.extend({
  layout,
  tagName: '',
  motionService: Ember.inject.service('-ea-motion'),
  duration: 2000,

  init() {
    this._enteringComponents = [];
    this._currentComponents = [];
    this._leavingComponents = [];
    this._prevItems = [];
    this._firstTime = true;
    this.get('motionService').register(this);
    this._super();
  },

  isAnimating: Ember.computed.or('animate.isRunning', 'runThenRemove.isRunning'),

  willDestroyElement() {
    let removedSprites = flatMap(this._currentComponents, component => component.sprites());
    removedSprites.forEach(sprite => sprite.measureInitialBounds());
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

    let matchedSpritePairs;
    [insertedSprites, removedSprites, matchedSpritePairs] = yield this.get('motionService.farMatch').perform(insertedSprites, removedSprites);

    // Removal motions have different lifetimes than the kept or
    // inserted motions because an interrupting animation doesn't cancel them.
    this.get('runThenRemove').perform(createRemovalMotions(removedSprites, this.get('duration')), removedSprites);

    yield * parallel(createMotions(firstTime, insertedSprites, keptSprites, matchedSpritePairs, this.get('duration')), onError);
    keptSprites.forEach(sprite => sprite.unlock());
    insertedSprites.forEach(sprite => sprite.unlock());
    this._notifyContainer('unlock');
  }).restartable(),

  runThenRemove: task(function * (generators, sprites) {
    try {
      yield * parallel(generators);
    } finally {
      sprites.forEach(sprite => sprite.remove());
    }
  }),

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

function createMotions(firstTime, insertedSprites, keptSprites, matchedSpritePairs, duration) {
  let generators = [];
  if (firstTime) {
    insertedSprites.forEach(sprite => {
      sprite.reveal();
    });
  } else {
    insertedSprites.forEach(sprite => {
      sprite.initialBounds = {
        left: sprite.finalBounds.left + 1000,
        top: sprite.finalBounds.top
      };
      sprite.translate(sprite.initialBounds.left - sprite.finalBounds.left, sprite.initialBounds.top - sprite.finalBounds.top);
      let move = new Move(sprite, { duration });
      sprite.reveal();
      generators.push(move.run());
    });
  }

  matchedSpritePairs.forEach(([oldSprite, newSprite]) => {
    newSprite.replaces(oldSprite);
    newSprite.reveal();
    keptSprites.push(newSprite);
  });

  keptSprites.forEach(sprite => {
    let move = new Move(sprite, { duration });
    generators.push(move.run());
  });

  return generators;
}

function createRemovalMotions(removedSprites, duration) {
  let removalGenerators = [];
  removedSprites.forEach(sprite => {
    sprite.append();
    sprite.lock();
    sprite.finalBounds = {
      left: sprite.initialBounds.left + 1000,
      top: sprite.initialBounds.top
    };
    let move = new Move(sprite, { duration });
    removalGenerators.push(move.run());
  });
  return removalGenerators;
}
