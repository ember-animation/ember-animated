import { setComponentTemplate } from '@ember/component';
import TwoListsExample from '../between-two-lists-example/component';
import layout from '../between-two-lists-example/template';
import { action } from '@ember/object';

class LoggedTwoListsExample extends TwoListsExample {
  @action transition(context) {
    this.args.fullLog(context);
    return super.transition(context);
  }
}

// Re-use template.
export default setComponentTemplate(layout, LoggedTwoListsExample);
