/* if changes are made here please also reflect them in
the comments in the docs */
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { fadeOut } from 'ember-animated/motions/opacity';

export default Component.extend({
  init() {
    this._super();
    this.items = ['A', 'B', 'C', 'D', 'E'];
  },

  *transition({ keptSprites, removedSprites }) {
    keptSprites.forEach(move);
    removedSprites.forEach(fadeOut);
  },

  removeItem(item) {
    this.set(
      'items',
      this.items.filter((i) => i !== item),
    );
  },
});
