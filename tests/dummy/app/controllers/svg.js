import Controller from '@ember/controller';
import { computed } from '@ember/object';
import move from 'ember-animated/motions/move';
import { printSprites } from 'ember-animated';

export default Controller.extend({
  bubbles: computed(function() {
    let list = [];
    for (let id = 0; id < 10; id++) {
      list.push({
        id,
        x: Math.floor(Math.random()*100),
        y: Math.floor(Math.random()*100),
        radius: 10
      });
    }
    return list;
  }),

  moveThem: function * ({ keptSprites }) {
    printSprites(arguments[0]);
    keptSprites.forEach(move);
  },

  actions: {
    move() {
      this.notifyPropertyChange('bubbles');
    }
  }
});
