import Ember from 'ember';
import Opacity from 'ember-animated/motions/opacity';
import Move from 'ember-animated/motions/move';

export default Ember.Controller.extend({
  showDetail: true,
  fade,
  fromSide,
  actions: {
    toggle() {
      this.set('showDetail', !this.get('showDetail'));
    }
  }
});

function * fade() {
  this.insertedSprites.forEach(s => {
    this.animate(new Opacity(s, { from: 0 }));
  });
  this.removedSprites.forEach(s => {
    this.animate(new Opacity(s, { to: 0 }));
  });
}


function * fromSide() {
  this.insertedSprites.forEach(s => {
    s.startAtPixel({ x: window.outerWidth * 0.8 });
    this.animate(new Move(s));
  });
  this.removedSprites.forEach(s => {
    s.endAtPixel({ x: window.outerWidth * 0.8 });
    this.animate(new Move(s));
  });
}
