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
      collection.members.unshiftObject({
        name: String(counter++)
      });
    },
    addMembers() {
      this.get('collections').forEach(collection => {
        collection.members.unshiftObject({
          name: String(counter++)
        });
      });
    },
    addCollection() {
      this.get('collections').unshiftObject({
        title: String(counter++),
        members: Ember.A()
      });
    }
  }
});

let counter = 0;
