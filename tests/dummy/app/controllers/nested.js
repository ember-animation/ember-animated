import Ember from 'ember';
import Move from 'ember-animated/motions/move';

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

function * first() {
  this.insertedSprites.forEach(sprite => {
    sprite.reveal();
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });
}

function * subsequent() {
  this.insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.outerWidth });
    this.animate(new Move(sprite));
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });

  this.removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.outerWidth * 0.8 });
    this.animate(new Move(sprite));
  });

}

function rules(firstTime) {
  if (firstTime) {
    return first;
  } else {
    return subsequent;
  }
}
