import Ember from 'ember';
import Move from 'ember-animated/motions/move';
import Scale from 'ember-animated/motions/scale';

export function * transition() {
  this.insertedSprites.forEach(sprite => {
    let oldSprite = this.matchFor(sprite);
    if (oldSprite) {
      sprite.startAt(oldSprite);
      sprite.startScaledTo(oldSprite);
      this.animate(new Move(sprite));
      this.animate(new Scale(sprite));
    } else {
      sprite.reveal();
    }
  });
}

export default Ember.Controller.extend({
  transition
});
