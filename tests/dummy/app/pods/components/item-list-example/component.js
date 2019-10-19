import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { task } from 'ember-animated/-private/ember-scheduler';
import { current } from 'ember-animated/-private/scheduler';

export default Component.extend({
  motionService: service('-ea-motion'),
  currentSort: numeric,
  duration: 1000,
  items: computed({
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
      task: current,
      duration: this.get('duration'),
      component: this
    });
    let items = this.get('items');
    this.set('items', items.concat([makeRandomItem()]).sort(this.currentSort).map(elt => ({ id: elt.id })));
  }),
  removeItem: task(function * (which) {
    this.get('motionService').willAnimate({
      task: current,
      duration: this.get('duration'),
      component: this
    });
    let items = this.get('items');
    this.set('items', items.filter(i => i !== which));
  }),
  actions: {
    addItem() {
      this.get('addItem').perform();
    },
    removeItem(which) {
      this.get('removeItem').perform(which);
    }
  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}
