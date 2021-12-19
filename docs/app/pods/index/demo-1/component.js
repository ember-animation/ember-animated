import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fade from 'ember-animated/transitions/fade';
import dedent from '../utils/dedent';

export default class IndexDemo1 extends Component {
  @tracked transitionsRunning = 0;

  @tracked guests = 1;

  transition = fade;

  @action addGuest() {
    if (this.guests < 6) {
      this.guests++;
    }
  }

  @action removeGuest() {
    if (this.guests > 1) {
      this.guests--;
    }
  }

  templateDiff = dedent`
    - {{#each this.guests}}
    + {{#animated-each this.guests use=this.transition}}
        <Icon "user" />
    - {{/each}}
    + {{/animated-each}}
  `;

  componentDiff = dedent`
      import Component from '@glimmer/component';
      import { tracked } from '@glimmer/tracking';
      import { action } from '@ember/object';
    + import fade from 'ember-animated/transitions/fade';

      export default class extends Component {
    +   transition = fade;
    +
        @tracked guests = 1;

        @action addGuest () {
          if (this.guests < 6) {
            this.guests++;
          }
        }

        @action removeGuest () {
          if (this.guests > 1) {
            this.guests--;
          }
        }
      }
  `;
}
