import Ember from 'ember';
import { FadeIn, FadeOut } from 'ember-animated/motions/opacity';


function * transition() {
  this.insertedSprites.forEach(sprite => {
    this.animate(new FadeIn(sprite));
  });

  this.removedSprites.forEach(sprite => {
    this.animate(new FadeOut(sprite));
  });
}

export default Ember.Controller.extend({
  transition
});
