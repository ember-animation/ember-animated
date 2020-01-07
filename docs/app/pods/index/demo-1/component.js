import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';
import dedent from '../utils/dedent';

export default Component.extend({
  transitionsRunning: 0,

  guests: 1,

  transition: fade,

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
    },
  },

  templateDiff: dedent`
    - {{#each guests}}
    + {{#animated-each guests use=transition}}
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
