import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../templates/components/animated-value';

export default Component.extend({
  tagName: '',
  layout,
  items: computed('value', function() {
    return [this.get('value')];
  })
}).reopenClass({
  positionalParams: ['value']
});
