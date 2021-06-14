import { layout as templateLayout } from '@ember-decorators/component';
import Component from '@ember/component';
// @ts-ignore: templates don't have types
import layout from '../templates/components/animated-orphans';
import '../element-remove';

/**
  A component that adopts any orphaned sprites so they can continue animating even
  after their original parent component has been destroyed. This relies on cloning
  DOM nodes, and the cloned nodes will be inserted as children of animated-orphans.
  ```hbs
  <AnimatedOrphans/>
  ```
  @class animated-orphans
  @public
*/
@templateLayout(layout)
export default class AnimatedOrphans extends Component {
  _isDestroying = false;

  willDestroyElement() {
    this._isDestroying = true;
  }
}
