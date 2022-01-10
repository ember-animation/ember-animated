/* eslint-disable require-yield */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
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

export default class IndexDemo2 extends Component {
  @tracked notifications = [];

  @tracked nextId = 0;

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
  }

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
  }

  @action createNotification() {
    let id = this.nextId;
    this.notifications = [
      ...this.notifications,
      {
        id,
        text: MESSAGES[id % MESSAGES.length],
      },
    ];

    this.nextId++;
  }

  @action destroyNotification(notification) {
    let i = this.notifications.findIndex((n) => n === notification);
    this.notifications.splice(i, 1);

    // eslint-disable-next-line no-self-assign
    this.notifications = this.notifications; // trigger autotracking
  }

  templateDiff = dedent`
      {{#animated-each this.notifications use=this.transition as |notification|}}
        <NotificationCard @notification=notification />
      {{/animated-each}}
  `;

  componentDiff = dedent`
      import Component from '@glimmer/component';
      import { tracked } from '@glimmer/tracking';
    - import fade from 'ember-animated/transitions/fade';
    + import move from 'ember-animated/motions/move';
    + import { fadeOut } from 'ember-animated/motions/opacity';

      export default class extends Component {

    -   transition = fade;
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

      }
  `;
}
