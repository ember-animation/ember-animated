import Ember from 'ember';
import { task } from 'ember-concurrency';

export default Ember.Component.extend({
  motionService: Ember.inject.service('-ea-motion'),
  currentSort: numeric,
  duration: 1000,
  items: Ember.computed({
    get() {
      let result = [];
      for (let i = 0; i < 10; i++) {
        result.push(makeRandomItem());
      }
      return result.sort(numeric);
    },
    set(k,v) {
      return v;
    }
  }),
  addItem: task(function * () {
    this.get('motionService').willAnimate({
      task: this.get('addItem.last'),
      duration: this.get('duration')
    });
    let items = this.get('items');
    this.set('items', items.concat([makeRandomItem()]).sort(this.currentSort).map(elt => ({ id: elt.id })));
  }),
  removeItem: task(function * (which) {
    this.get('motionService').willAnimate({
      task: this.get('removeItem.last'),
      duration: this.get('duration')
    });
    let items = this.get('items');
    this.set('items', items.filter(i => i !== which));
  })
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}
