import Ember from 'ember';
import { FadeIn, FadeOut } from 'ember-animated/motions/opacity';

export default Ember.Controller.extend({
  tableMode: false,
  fade,
  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    }
  }
});

function fade(initialRender) {
  if (!initialRender) {
    return function * () {
      this.insertedSprites.forEach(s => this.animate(new FadeIn(s)));
      this.removedSprites.forEach(s => this.animate(new FadeOut(s)));
    };
  }
}
