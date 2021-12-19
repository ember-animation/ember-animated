import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import SpritesExample from '../sprites-example/component';
import layout from '../sprites-example/template';

class LoggedSpritesExample extends SpritesExample {
  @action transition(context) {
    this.args.logTransition(context);
    return super.transition(context);
  }
}

// Re-use template.
export default setComponentTemplate(layout, LoggedSpritesExample);
