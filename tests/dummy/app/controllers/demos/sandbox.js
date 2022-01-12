import Controller from '@ember/controller';
import { wait } from 'ember-animated';

export default class extends Controller {
  *typingTransition({ duration, insertedSprites }) {
    for (let sprite of insertedSprites) {
      sprite.moveToFinalPosition();
      sprite.reveal();
      let width = sprite.finalBounds.width;

      sprite.applyStyles({
        overflow: 'hidden',
      });

      sprite.applyStyles({
        width: `${width * 0.2}px`,
      });

      yield wait(duration / 5);

      sprite.applyStyles({
        width: `${width * 0.4}px`,
      });

      yield wait(duration / 5);

      sprite.applyStyles({
        width: `${width * 0.6}px`,
      });

      yield wait(duration / 5);

      sprite.applyStyles({
        width: `${width * 0.8}px`,
      });

      yield wait(duration / 5);

      sprite.applyStyles({
        width: `${width}px`,
      });

      yield wait(duration / 5);
    }
  }
}
