import Ember from 'ember';
import Move, { ContinuePrior } from 'ember-animated/motions/move';
import Scale from 'ember-animated/motions/scale';
import Opacity from 'ember-animated/motions/opacity';

function * transition() {
  this.receivedSprites.forEach(sprite => {
    sprite.scale(sprite.initialBounds.width / sprite.finalBounds.width, sprite.initialBounds.height / sprite.finalBounds.height);
    sprite.applyStyles({
      'z-index': 1
    });
    this.animate(new Move(sprite));
    this.animate(new Scale(sprite));
  });

  this.sentSprites.forEach(sprite => {
    sprite.applyStyles({
      'z-index': 1
    });
    this.animate(new Move(sprite));
    this.animate(new Scale(sprite));
  });

  this.removedSprites.forEach(sprite => {
    sprite.endTranslatedBy(0, 0);
    this.animate(new ContinuePrior(sprite));
    this.animate(new Opacity(sprite, { to: 0 }));
  });
}

export default Ember.Controller.extend({
  transition
});
