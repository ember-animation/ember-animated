import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moveCircle from '../motions/move-circle';

export default Controller.extend({
  bubbles: computed(function() {
    let list = [];
    for (let id = 0; id < 10; id++) {
      list.push({
        id,
        x: Math.floor(Math.random()*100),
        y: Math.floor(Math.random()*100),
        radius: Math.floor(Math.random()*50)
      });
    }
    return list;
  }),

  moveThem: function * ({ keptSprites }) {
    keptSprites.forEach(moveCircle);
  },

  actions: {
    move() {
      this.notifyPropertyChange('bubbles');
    }
  }
});
