import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this._super();
    this.set('leftItems', makeRandomList());
  },
  actions: {
    swap() {
      if (this.get('leftItems')) {
        this.set('leftItems', null);
        this.set('rightItems', makeRandomList());
      } else {
        this.set('leftItems', makeRandomList());
        this.set('rightItems', null);
      }
    }
  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 7; i++) {
    result.push(makeRandomItem());
  }
  result.push({ id: 1 });
  result.push({ id: 400 });
  result.push({ id: 800 });

  return result.sort(numeric);
}
