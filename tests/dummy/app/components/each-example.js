import { A } from '@ember/array';
import { computed, set } from '@ember/object';
import Component from '@ember/component';
import { task, timeout } from 'ember-animated/-private/ember-scheduler';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  transition: function * ({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: window.outerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach(sprite => {
      // the 0.8 here is purely so I can easily see that the elements
      // are being properly removed immediately after they get far
      // enough
      sprite.endAtPixel({ x: window.outerWidth * 0.8 });
      move(sprite, { easing: easeIn });
    });
  },

  currentSort: numeric,
  items: computed({
    get() {
      let result = [];
      for (let i = 0; i < 10; i++) {
        result.push(makeRandomItem());
      }
      return A(result.sort(numeric));
    },
    set(k,v) {
      return A(v);
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
      set(item, 'id', makeRandomItem().id);
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
