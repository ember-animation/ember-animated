import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';
import always from 'ember-animated/rules/always';

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

export default Controller.extend({
  transition,
  always
});
