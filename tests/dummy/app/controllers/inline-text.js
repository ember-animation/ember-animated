import Ember from 'ember';
import Opacity from 'ember-animated/motions/opacity';
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
      // We yield Promise.all here because we want to wait for this
      // step before starting what comes after.
      yield Promise.all(this.removedSprites.map(s => {
        if (s.revealed) {
          return this.animate(new Opacity(s, {
            to: 0,
            duration: this.duration / 2
          }));
        }
      }));

      // Once all fading out has happened, we can fade in the inserted
      // or kept sprites. Note that we get keptSprites if some things
      // were fading out and then we get interrupted and decide to
      // keep them around after all.
      this.insertedSprites.concat(this.keptSprites).map(s => this.animate(new Opacity(s, {
        to: 1,
        duration: this.duration / 2
      })));
    };
  }
}
