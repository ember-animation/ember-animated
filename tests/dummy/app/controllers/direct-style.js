import { A } from '@ember/array';
import Controller from '@ember/controller';
import { htmlSafe } from '@ember/string';
import EmberObject, { computed } from '@ember/object';
import move from 'ember-animated/motions/move';

let Item = EmberObject.extend({
  style: computed('x', 'y', function() {
    return htmlSafe(`top: ${parseFloat(this.get('y'))}px; left: ${parseFloat(this.get('x'))}px; `);
  })
});

export default Controller.extend({
  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },

  items: computed(function() {
    let items = A();
    for (let i = 0; i < 4; i++) {
      items.push(Item.create({ id: i, x: somewhere(), y: somewhere() }));
    }
    return items;
  }),
  actions: {
    go() {
      this.get('items').forEach(i => {
        i.set('x', somewhere());
        i.set('y', somewhere());
      });
    }
  }
});

function somewhere() {
  return Math.random() * 300;
}
