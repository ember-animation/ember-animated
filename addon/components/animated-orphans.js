import Component from '@ember/component';
import layout from '../templates/components/animated-orphans';
import '../element-remove';

/**
  A component that adopts any orphaned sprites so they can continue animating even
  after their original parent component has been destroyed. This relies on cloning
  DOM nodes, and the cloned nodes will be inserted as children of animated-orphans.
  ```hbs
  {{animated-orphans}}
  ```
  @class animated-orphans
  @public
*/
export default Component.extend({
  layout,
  tagName: '',
  isEmberAnimatedOrphans: true,

  willDestroyElement() {
    this.set('_isDestroying', true);
  },
});
