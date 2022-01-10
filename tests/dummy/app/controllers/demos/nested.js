import Controller from '@ember/controller';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';

let counter = 0;

export default class extends Controller {
  @tracked collections = [
    {
      title: 'A',
      members: [{ name: 'one' }, { name: 'two' }, { name: 'three' }],
    },
    {
      title: 'B',
      members: [{ name: 'four' }, { name: 'five' }, { name: 'six' }],
    },
  ];

  *transition({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite);
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      // the 0.8 here is purely so I can easily see that the elements
      // are being properly removed immediately after they get far
      // enough
      sprite.endAtPixel({ x: window.innerWidth * 0.8 });
      move(sprite);
    });
  }

  @action addMember(collection) {
    collection.members.unshift({ name: String(counter++) });

    // trigger autotracking
    collection.members = [...collection.members];
    this.collections = [...this.collections];
  }

  @action addMembers() {
    this.get('collections').forEach((collection) => {
      collection.members.unshiftObject({
        name: String(counter++),
      });
    });
  }

  @action addCollection() {
    this.collections = [
      {
        title: String(counter++),
        members: [],
      },
      ...this.collections,
    ];
  }
}
