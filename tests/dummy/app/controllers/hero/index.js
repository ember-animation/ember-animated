import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';

function * transition({ insertedSprites, receivedSprites, removedSprites }) {
  insertedSprites.forEach(sprite => {
    opacity(sprite, { from: 0, to: 1 });
  });

  receivedSprites.forEach(sprite => {
    opacity(sprite, { to: 1 });
  });

  removedSprites.forEach(sprite => {
    opacity(sprite, { to: 0 });
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
