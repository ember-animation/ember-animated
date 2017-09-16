import Ember from 'ember';
import { task, timeout } from 'ember-animated/ember-scheduler';
import Move from 'ember-animated/motions/move';

export default Ember.Component.extend({
  rules,
  currentSort: numeric,
  items: Ember.computed({
    get() {
      let result = [];
      for (let i = 0; i < 10; i++) {
        result.push(makeRandomItem());
      }
      return Ember.A(result.sort(numeric));
    },
    set(k,v) {
      return Ember.A(v);
    }
  }),

  chaos: task(function * (running) {
    if (!running) { return; }
    while (true) {
      yield timeout(1000);
      this.send('addItem');
      yield timeout(1000);
      this.send('removeItem', this.get('items')[Math.floor(Math.random()*this.get('items.length'))]);
    }
  }).restartable(),

  actions: {
    addItem() {
      let items = this.get('items');
      // This deliberately uses stable keys but unstable objects
      let item = makeRandomItem();
      this.set('message', `add ${item.id}`);
      this.set('items', items.concat([item]).sort(this.currentSort).map(elt => ({ id: elt.id })));
    },
    removeItem(which) {
      let items = this.get('items');
      this.set('message', `remove ${which.id}`);
      this.set('items', items.filter(i => i !== which));
    },
    replaceItem(which) {
      let items = this.get('items');
      let index = items.indexOf(which);
      this.set('items', items.slice(0, index).concat([makeRandomItem()]).concat(items.slice(index+1)));
    },
    mutate(item) {
      Ember.set(item, 'id', makeRandomItem().id);
    },
    sortNumeric() {
      let items = this.get('items');
      this.currentSort = numeric;
      this.set('items', items.slice().sort(this.currentSort));
    },
    shuffle() {
      let items = this.get('items');
      this.currentSort = random;
      this.set('items', items.slice().sort(this.currentSort));
    },
    startChaos() {
      this.get('chaos').perform(true);
    },
    stopChaos() {
      this.get('chaos').perform(false);
    }

  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}

function random() {
  return Math.random() - 0.5;
}

function * first() {
  this.insertedSprites.forEach(sprite => {
    sprite.reveal();
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });
}

function * subsequent() {
  this.insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.outerWidth });
    this.animate(new Move(sprite));
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });

  this.removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.outerWidth * 0.8 });
    this.animate(new Move(sprite));
  });

}

function rules(firstTime) {
  if (firstTime) {
    return first;
  } else {
    return subsequent;
  }
}
