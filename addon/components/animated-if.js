import Component from '@ember/component';
import layout from '../templates/components/animated-if';
import { computed } from '@ember/object';
/**
  A drop in replacement for `{{#if}}` that animates changes to a list when the predicate changes. 
  Animated-if uses the same arguments as animated-each.
  ```hbs
   {{#animated-if showThing use=myFancyTransition}}
          <div>myContent</div>
        {{/animated-if}}
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
