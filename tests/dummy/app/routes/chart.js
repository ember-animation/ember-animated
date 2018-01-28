import Route from '@ember/routing/route';
import Papa from 'papaparse';

// var pop = Papa.parse(
// 	'/dummy/public/population.csv', {
// 	header: true
// }).data;

export default Route.extend({

    model() {
        return 'RETURNED STRING';
      }

});