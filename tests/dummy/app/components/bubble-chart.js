import Component from '@ember/component';
import layout from '../templates/components/bubble-chart';
import { computed } from '@ember/object';

export default Component.extend({

  currentYear: 2015,
  points: computed('currentYear', 'model', function(){
    let currentYear = this.get('currentYear');
    let myRow = this.get('model').filter(row => row.year === currentYear);
    return myRow.sort((a, b) => b.population - a.population);
  }),

  layout
});

