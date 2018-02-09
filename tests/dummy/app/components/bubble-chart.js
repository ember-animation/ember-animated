import Component from '@ember/component';
import layout from '../templates/components/bubble-chart';
import { computed } from '@ember/object';

export default Component.extend({

  currentYear: 1980,
  points: computed('currentYear', 'model', function(){
    let currentYear = this.get('currentYear');
    return this.get('model').filter(row => row.year === currentYear);
  }),

  layout
});

