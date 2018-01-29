import Component from '@ember/component';
import layout from '../templates/components/animated-if';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',
  realGroup: computed('group', function() {
    return this.get('group') || `animated_if_${Math.floor(Math.random()*1000000)}`;
  }),
}).reopenClass({
  positionalParams: ['predicate']
});
