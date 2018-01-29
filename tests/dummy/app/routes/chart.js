import Route from '@ember/routing/route';
// import Fetch from 'node_modules/node-fetch'
import Papa from 'papaparse';



// requestAnimeAwait();

// let pop = Papa.parse(
// 	'/dummy/public/population.csv', {
// 	header: true
// }).data;

// var pop = [{    
//     y1800: 144, y1900: 267, country: 'usa'
// },
// {
//     y1800: 174, y1900: 355, country: 'can'
// }
// ]

export default Route.extend({

    async model() {
        const response = await fetch(`population.csv`)
        const text = await response.text();
        console.log("async/await based");
        console.log(text);

        let pop = Papa.parse(text, {header: true}).data;
        return pop;
      }

});