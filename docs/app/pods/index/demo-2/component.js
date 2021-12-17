import Component from '@ember/component';
import { A } from '@ember/array';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import dedent from '../utils/dedent';

const MESSAGES = [
  'Your message has been sent!',
  'You successfully deleted the database. On production.',
  'You upgraded your plan.',
  'You emailed 7,042 people the poop emoji.',
  'Your document was saved.',
  'Did you try turning it off and on again?',
  'The settings were updated.',
  "'Join the army', they said!",
  "'See the world!', they said!",
  "I'd rather be sailing.",
];

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('notifications', A([]));
  },

  nextId: 0,

  *originalTransition({ insertedSprites, removedSprites, keptSprites }) {
    for (let sprite of insertedSprites) {
      fadeIn(sprite);
    }

    for (let sprite of keptSprites) {
      sprite.moveToFinalPosition();
      fadeIn(sprite);
    }

    for (let sprite of removedSprites) {
      fadeOut(sprite);
    }
  },

  *separateTransition({ insertedSprites, removedSprites, keptSprites }) {
    for (let sprite of insertedSprites) {
      sprite.startTranslatedBy(0, -sprite.finalBounds.height);
      move(sprite);
    }

    for (let sprite of keptSprites) {
      move(sprite);
    }

    for (let sprite of removedSprites) {
      fadeOut(sprite);
    }
  },

  createNotification: action(function () {
    let id = this.get('nextId');
    this.get('notifications').pushObject({
      id,
      text: MESSAGES[id % MESSAGES.length],
    });

    this.incrementProperty('nextId');
  }),

  destroyNotification: action(function (notification) {
    this.get('notifications').removeObject(notification);
  }),

  templateDiff: dedent`
      {{#animated-each notifications use=transition as |notification|}}
        <NotificationCard @notification=notification />
      {{/animated-each}}
  `,

  componentDiff: dedent`
      import Component from '@ember/component';
    - import fade from 'ember-animated/transitions/fade';
    + import move from 'ember-animated/motions/move';
    + import { fadeOut } from 'ember-animated/motions/opacity';

      export default Component.extend({

    -   transition: fade
    +   * transition({ keptSprites, insertedSprites, removedSprites }) {
    +     for (let sprite of insertedSprites) {
    +       sprite.startTranslatedBy(0, -sprite.finalBounds.height);
    +       move(sprite);
    +     }
    +
    +     for (let sprite of keptSprites) {
    +       move(sprite);
    +     }
    +
    +     for (let sprite of removedSprites) {
    +       fadeOut(sprite);
    +     }
    +   }

      });
  `,
});
