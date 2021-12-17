import Component from '@ember/component';
import { action } from '@ember/object';
import fade from 'ember-animated/transitions/fade';
import dedent from '../utils/dedent';

export default Component.extend({
  transitionsRunning: 0,

  guests: 1,

  transition: fade,

  addGuest: action(function () {
    if (this.guests < 6) {
      this.incrementProperty('guests');
    }
  }),

  removeGuest: action(function () {
    if (this.guests > 1) {
      this.decrementProperty('guests');
    }
  }),

  templateDiff: dedent`
    - {{#each this.guests}}
    + {{#animated-each this.guests use=this.transition}}
        <Icon 'user' />
    - {{/each}}
    + {{/animated-each}}
  `,

  componentDiff: dedent`
      import Component from '@ember/component';
    + import fade from 'ember-animated/transitions/fade';

      export default Component.extend({
    +   transition: fade,
    +
        guests: 1,

        actions: {
          addGuest() {
            if (this.guests < 6) {
              this.incrementProperty('guests');
            }
          },

          removeGuest() {
            if (this.guests > 1) {
              this.decrementProperty('guests');
            }
          }
        }
      });
  `,
});
