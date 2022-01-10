import Controller from '@ember/controller';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import opacity from 'ember-animated/motions/opacity';
import move from 'ember-animated/motions/move';

export default class extends Controller {
  @tracked showDetail = true;

  *fade({ insertedSprites, receivedSprites, removedSprites }) {
    insertedSprites.forEach((s) => opacity(s, { from: 0 }));
    receivedSprites.forEach((s) => opacity(s));
    removedSprites.forEach((s) => opacity(s, { to: 0 }));
  }

  *fromSide({ insertedSprites, receivedSprites, removedSprites }) {
    insertedSprites.forEach((s) => {
      s.startAtPixel({ x: window.innerWidth * 0.8 });
      move(s);
    });
    receivedSprites.forEach(move);
    removedSprites.forEach((s) => {
      s.endAtPixel({ x: window.innerWidth * 0.8 });
      move(s);
    });
  }

  @action toggle() {
    this.showDetail = !this.showDetail;
  }
}
