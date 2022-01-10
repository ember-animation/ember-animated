import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from 'dummy/utils/tracking';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import { parallel } from 'ember-animated';

export default class extends Controller {
  @tracked showingModal = false;

  *transition(context) {
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
  }

  @action launch() {
    this.showingModal = true;
  }

  @action dismiss() {
    this.showingModal = false;
  }
}
