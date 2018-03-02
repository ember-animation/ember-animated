import Controller from '@ember/controller';
import opacity from 'ember-animated/motions/opacity';
import move from 'ember-animated/motions/move';
import always from 'ember-animated/rules/always';

export default Controller.extend({
  showDetail: true,
  fade,
  always,
  fromSide,
  actions: {
    toggle() {
      this.set('showDetail', !this.get('showDetail'));
    }
  }
});

function * fade({ insertedSprites, receivedSprites, removedSprites }) {
  insertedSprites.forEach(s => opacity(s, { from: 0 }));
  receivedSprites.forEach(s => opacity(s));
  removedSprites.forEach(s => opacity(s, { to: 0 }));
}


function * fromSide({ insertedSprites, receivedSprites, removedSprites }) {
  insertedSprites.forEach(s => {
    s.startAtPixel({ x: window.outerWidth * 0.8 });
    move(s);
  });
  receivedSprites.forEach(move);
  removedSprites.forEach(s => {
    s.endAtPixel({ x: window.outerWidth * 0.8 });
    move(s);
  });
}
