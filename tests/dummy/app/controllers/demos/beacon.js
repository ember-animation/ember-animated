import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import { parallel } from 'ember-animated';

export default Controller.extend({
  showingModal: false,

  transition: function* (context) {
    let { insertedSprites, removedSprites, keptSprites, beacons } = context;
    insertedSprites.forEach((sprite) => {
      sprite.startAtSprite(beacons.beacontest);
      parallel(move(sprite, scale(sprite)));
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      sprite.endAtSprite(beacons.beacontest);
      parallel(move(sprite, scale(sprite), opacity));
    });
  },

  actions: {
    launch() {
      this.set('showingModal', true);
    },
    dismiss() {
      this.set('showingModal', false);
    },
  },
});
