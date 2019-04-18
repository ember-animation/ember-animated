import Controller from '@ember/controller';
import { wait } from 'ember-animated';

export default Controller.extend({

  typingTransition: function*({ duration, insertedSprites }) {
    for (let sprite of insertedSprites) {
      sprite.moveToFinalPosition();
      sprite.reveal();
      let width = sprite.finalBounds.width;

      sprite.applyStyles({
        overflow: 'hidden'
      });

      sprite.applyStyles({
        width: width * 0.2
      });

      yield wait(duration/5);

      sprite.applyStyles({
        width: width * 0.4
      });

      yield wait(duration/5);

      sprite.applyStyles({
        width: width * 0.6
      });

      yield wait(duration/5);

      sprite.applyStyles({
        width: width * 0.8
      });

      yield wait(duration/5);

      sprite.applyStyles({
        width: width
      });

      yield wait(duration/5);

    }
  }

});
