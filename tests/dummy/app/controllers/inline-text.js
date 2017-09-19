import Ember from 'ember';
import { FadeIn, FadeOut } from 'ember-animated/motions/opacity';
import { Promise } from 'ember-animated/concurrency-helpers';

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
      yield Promise.all(this.removedSprites.map(s => this.animate(new FadeOut(s, { duration: this.duration / 2}))));
      this.insertedSprites.map(s => this.animate(new FadeIn(s, { duration: this.duration / 2 })));
    };
  }
}
