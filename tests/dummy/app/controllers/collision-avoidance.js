import Controller from '@ember/controller';
import Move from 'ember-animated/motions/move';

export default Controller.extend({
  transition,

  init() {
    this._super();
    let items = [];
    for (let id = 0; id < 10; id++) {
      items.push({ id });
    }
    this.set('items', items);
  },
  actions: {
    shuffle() {
      let items = this.get('items');
      let newItems = [];
      while (items.length > 0) {
        let index = Math.floor(Math.random() * items.length);
        newItems.push(items[index]);
        items.splice(index, 1);
      }
      this.set('items', newItems);
    }
  }
});

function * transition() {
  this.keptSprites.forEach(sprite => this.animate(new Move(sprite)));
}
