import Controller from '@ember/controller';
import Opacity from 'ember-animated/motions/opacity';

function * transition() {
  this.insertedSprites.forEach(sprite => {
    this.animate(new Opacity(sprite, { from: 0, to: 1 }));
  });

  this.receivedSprites.forEach(sprite => {
    this.animate(new Opacity(sprite, { to: 1 }));
  });

  this.removedSprites.forEach(sprite => {
    this.animate(new Opacity(sprite, { to: 0 }));
  });
}

function * share() {
  // TODO: if we don't set a transition, our sprites aren't available
  // for far matching
}

export default Controller.extend({
  transition,
  share
});
