import Controller from '@ember/controller';
import move, { continuePrior } from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import opacity from 'ember-animated/motions/opacity';
import always from 'ember-animated/rules/always';

function * transition({ receivedSprites, sentSprites, removedSprites }) {
  receivedSprites.forEach(sprite => {
    sprite.scale(sprite.initialBounds.width / sprite.finalBounds.width, sprite.initialBounds.height / sprite.finalBounds.height);
    sprite.applyStyles({
      'z-index': 1
    });
    move(sprite);
    scale(sprite);
  });

  sentSprites.forEach(sprite => {
    sprite.applyStyles({
      'z-index': 1
    });
    move(sprite);
    scale(sprite);
  });

  removedSprites.forEach(sprite => {
    sprite.endTranslatedBy(0, 0);
    continuePrior(sprite);
    opacity(sprite, { to: 0 });
  });
}

export default Controller.extend({
  transition,
  always
});
