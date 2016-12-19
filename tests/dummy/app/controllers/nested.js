import Ember from 'ember';
import rules from 'ember-animated/transitions/default-list-transitions';

export default Ember.Controller.extend({
  rules,
  collections: Ember.A([
    {
      title: 'A',
      members: Ember.A([
        { name: 'one' },
        { name: 'two' },
        { name: 'three' }
      ])
    },
    {
      title: 'B',
      members: Ember.A([
        { name: 'four' },
        { name: 'five' },
        { name: 'six' }
      ])
    }
  ]),
  actions: {
    addMember(collection) {
      Ember.set(collection, 'members', collection.members.concat({
        name: String(counter++)
      }));
    },
    addCollection() {
      this.set('collections', this.get('collections').concat({
        title: String(counter++),
        members: Ember.A()
      }));
    }
  }
});

let counter = 0;
