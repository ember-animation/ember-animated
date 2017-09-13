import Ember from 'ember';
import Opacity from 'ember-animated/motions/opacity';

export default Ember.Controller.extend({
  showDetail: true,
  transition,
  actions: {
    toggle() {
      this.set('showDetail', !this.get('showDetail'));
    }
  }
});

function * transition() {
  this.insertedSprites.forEach(s => {
    this.animate(new Opacity(s, { from: 0 }));
  });
  this.removedSprites.forEach(s => {
    this.animate(new Opacity(s, { to: 0 }));
  });
}
