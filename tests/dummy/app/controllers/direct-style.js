import Ember from 'ember';
import rules from 'ember-animated/transitions/default-list-transitions';

let Item = Ember.Object.extend({
  style: Ember.computed('x', 'y', function() {
    return Ember.String.htmlSafe(`top: ${parseFloat(this.get('y'))}px; left: ${parseFloat(this.get('x'))}px; `);
  })
});

export default Ember.Controller.extend({
  rules,
  items: Ember.A([
    Item.create({ id: 1, x: somewhere(), y: somewhere() }),
    Item.create({ id: 2, x: somewhere(), y: somewhere() })
  ]),
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
