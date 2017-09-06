import Ember from 'ember';
import Move from 'ember-animated/motions/move';
import Scale from 'ember-animated/motions/scale';
import { FadeIn } from 'ember-animated/motions/opacity';

export function * transition() {
  this.insertedSprites.forEach(sprite => {
    this.animate(new FadeIn(sprite));
  });

  this.keptSprites.forEach(sprite => {
    sprite.scale(sprite.initialBounds.width / sprite.finalBounds.width, sprite.initialBounds.height / sprite.finalBounds.height);
    sprite.applyStyles({
      'z-index': 1
    });
    this.animate(new Move(sprite));
    this.animate(new Scale(sprite));
  });
}

export default Ember.Controller.extend({
  transition
});
