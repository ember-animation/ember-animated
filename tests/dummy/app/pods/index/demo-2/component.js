import Component from '@ember/component';
import { A } from '@ember/array';
import move from 'ember-animated/motions/move';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';
import { sort } from '@ember/object/computed';
import dedent from '../utils/dedent';
import { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';
import { computed } from '@ember/object';
import fade from 'ember-animated/transitions/fade';

const MESSAGES = [
  "Your message has been sent!",
  "You successfully deleted the database. On production.",
  "You upgraded your plan.",
  "You emailed 7,042 people the poop emoji.",
  "Your document was saved.",
  "Did you try turning it off and on again?",
  "The settings were updated.",
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

  * transition({ insertedSprites, removedSprites, keptSprites }) {
    for (let sprite of insertedSprites) {
      sprite.startTranslatedBy(0, sprite.finalBounds.height);
      move(sprite);
    }

    for (let sprite of keptSprites) {
      move(sprite);
    }

    for (let sprite of removedSprites) {
      fadeOut(sprite);
    }
  },

  fade,

  actions: {
    createNotification() {
      let id = this.get('nextId');
      this.get('notifications').pushObject({
        id,
        text: MESSAGES[id % MESSAGES.length]
      });

      this.incrementProperty('nextId');
    },

    destroyNotification(notification) {
      this.get('notifications').removeObject(notification);
    }
  },

  templateDiff: dedent`
    {{#animated-each notifications use=transition as |notification|}}
      <NotificationCard @notification=notification />
    {{/animated-each}}
  `,

  componentDiff: dedent`
      import Component from '@ember/component';
    - import fade from 'ember-animated/transitions/fade';
    + import move from 'ember-animated/motions/move';
    + import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

      export default Component.extend({

    -   transition: fade
    +   * transition({ keptSprites, insertedSprites, removedSprites }) {
    +     for (let sprite of insertedSprites) {
    +       sprite.startTranslatedBy(0, sprite.finalBounds.height);
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
  `

});
