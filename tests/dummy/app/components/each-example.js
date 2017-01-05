import Ember from 'ember';
import { task, taskGroup, timeout } from 'ember-concurrency';
import rules from 'ember-animated/transitions/default-list-transitions';

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

  chaos: taskGroup().restartable(),

  startChaos: task(function * () {
    while (true) {
      yield timeout(1000);
      this.send('addItem');
      yield timeout(1000);
      this.send('removeItem', this.get('items')[Math.floor(Math.random()*this.get('items.length'))]);
    }
  }).group('chaos'),

  stopChaos: task(function * () {}).group('chaos'),

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
