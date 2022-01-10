import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';

export default class BeaconDemo extends Component {
  @tracked showThing = false;

  *transition(context) {
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
  }

  @action launch() {
    this.showThing = true;
  }

  @action dismiss() {
    this.showThing = false;
  }
}
