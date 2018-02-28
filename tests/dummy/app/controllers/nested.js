import { A } from '@ember/array';
import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';

export default Controller.extend({
  rules,
  collections: A([
    {
      title: 'A',
      members: A([
        { name: 'one' },
        { name: 'two' },
        { name: 'three' }
      ])
    },
    {
      title: 'B',
      members: A([
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
        members: A()
      });
    }
  }
});

let counter = 0;

function * first({ insertedSprites, keptSprites }) {
  insertedSprites.forEach(sprite => {
    sprite.reveal();
  });

  keptSprites.forEach(move);
}

function * subsequent({ insertedSprites, keptSprites, removedSprites }) {
  insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.outerWidth });
    move(sprite);
  });

  keptSprites.forEach(sprite => {
    move(sprite);
  });

  removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.outerWidth * 0.8 });
    move(sprite);
  });

}

function rules({ firstTime }) {
  if (firstTime) {
    return first;
  } else {
    return subsequent;
  }
}
