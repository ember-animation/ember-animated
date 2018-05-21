import Component from '@ember/component';
import layout from '../templates/components/animated-if';
import { computed } from '@ember/object';
/**
  A drop in replacement for `{{#if}}` that animates changes to a list when the predicate changes. 
  Animated-if uses the same arguments as animated-each.
  ```hbs
   <button {{action toggleThing}}>Toggle</button>
   {{#animated-if showThing use=toLeft}}
     <div>myContent</div>
   {{/animated-if}}
  ```
  ```js
  import Component from '@ember/component';
  import { toLeft } from 'ember-animated/transitions/move-over';
  export default Component.extend({
    showThing: false,
    toLeft,
    toggleThing() {
      this.set('showThing', !this.showThing);
    }
  });
  ```

  @class animated-if
  @public
*/
export default Component.extend({
  layout,
  tagName: '',
  realGroup: computed('group', function() {
    return this.get('group') || `animated_if_${Math.floor(Math.random()*1000000)}`;
  }),
}).reopenClass({
  positionalParams: ['predicate']
});
