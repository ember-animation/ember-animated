import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';
import { Promise } from 'ember-animated';

export default Controller.extend({
  tableMode: false,
  fade: function * ({ removedSprites, insertedSprites, keptSprites, duration }) {
    // We yield Promise.all here because we want to wait for this
    // step before starting what comes after.
    yield Promise.all(removedSprites.map(s => {
      if (s.revealed) {
        return opacity(s, {
          to: 0,
          duration: duration / 2
        });
      }
    }));

    // Once all fading out has happened, we can fade in the inserted
    // or kept sprites. Note that we get keptSprites if some things
    // were fading out and then we get interrupted and decide to
    // keep them around after all.
    insertedSprites.concat(keptSprites).map(s => opacity(s, {
      to: 1,
      duration: duration / 2
    }));
  },

  actions: {
    toggle() {
      this.set('tableMode', !this.get('tableMode'));
    }
  }
});
