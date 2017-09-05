import Ember from 'ember';
import Move from 'ember-animated/motions/move';
import Scale from 'ember-animated/motions/scale';

export function * transition() {
  this.insertedSprites.forEach(sprite => {
    sprite.reveal();
  });

  this.keptSprites.forEach(sprite => {
    sprite.scale(sprite.initialBounds.width / sprite.finalBounds.width, sprite.initialBounds.height / sprite.finalBounds.height);
    this.animate(new Move(sprite));
    this.animate(new Scale(sprite));
  });
}

export default Ember.Controller.extend({
  transition
});
