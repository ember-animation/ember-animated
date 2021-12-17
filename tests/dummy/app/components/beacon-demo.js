import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';

export default Component.extend({
  showThing: false,

  transition: function* (context) {
    let { insertedSprites, removedSprites, keptSprites, beacons } = context;
    insertedSprites.forEach((sprite) => {
      sprite.startAtSprite(beacons.one);
      parallel(move(sprite, scale(sprite)));
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      sprite.endAtSprite(beacons.one);
      parallel(move(sprite, scale(sprite)));
    });
  },

  actions: {
    launch() {
      this.set('showThing', true);
    },
    dismiss() {
      this.set('showThing', false);
    },
  },
});
