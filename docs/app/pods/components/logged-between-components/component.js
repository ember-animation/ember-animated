import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import BetweenExample from '../between-components/component';
import layout from '../between-components/template';

class LoggedBetweenComponents extends BetweenExample {
  @action transition(context) {
    this.args.logTransition(context);
    return super.transition(context);
  }
}

// Re-use template.
export default setComponentTemplate(layout, LoggedBetweenComponents);
