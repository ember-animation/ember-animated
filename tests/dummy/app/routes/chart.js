import Route from '@ember/routing/route';
import Papa from 'papaparse';

export default Route.extend({

    async model() {
        let stringFromFile = await loadText('chart_model_data.txt'); // a JSON string
        let model = JSON.parse(stringFromFile);
        return model;
      }
});

/**
* Concatonates (and replaces) the 'country' and 'year' key-value pairs into 
* one key-value pair. The new key is 'countryYear' and its value is the 
* country string concatonated with a ' ' and the year string.
*/
function concatCountryYear(model) {
    model.forEach(row => {
        let newKey = row.country + " " + row.year;
        delete row.country;
        delete row.year;
        row.countryYear = newKey;
    })
}

async function loadText(url) {
    let response = await fetch(url);
    let text = await response.text();
    return text;
}

async function loadcsv(url) {
    let response = await fetch(url);
    let text = await response.text();
    return Papa.parse(text, {header: true}).data;
}

function forEachColumn(rows, body) {
    rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if(row[key] && key !== 'country'){
                body(row.country, key, row[key]);
            }
        })
    })
}

/**
 * Creates an array of objects with data parsed from .csv files.
 * Returns this array as a JSON string.
 * This function was called once to create model_data.txt to store 
 * the JSON string of the data needed to run the route.
 * Now that the file exists, this function is no longer called.
 */
async function makeJSON(model) {
    let pop = await loadcsv(`population.csv`);
    forEachColumn( pop, (country, year, population) =>
        model.push({country, year, population})
    )
    let gdp = await loadcsv(`gdp_per_capita_ppp.csv`);
    forEachColumn(gdp, (country, year, gdp) => {
        let datapoint = model.find(p => 
            p.country === country && p.year === year);
        if(datapoint) {
            datapoint.gdp = gdp;
        }
    })
    let life = await loadcsv(`life_expectancy_at_birth.csv`);
    forEachColumn(life, (country, year, life) => {
        let datapoint = model.find(p => 
            p.country === country && p.year === year);
        if(datapoint) {
            datapoint.life = life;
        }
    })
    concatCountryYear(model);
    return JSON.stringify(model);
}

/**
 * Does given object contain the properties life, gdp, and population?
 * If yes, return true. If no, return false.
 */
function hasAllThree(countryYearObj) {
    if( countryYearObj.life && 
        countryYearObj.gdp && 
        countryYearObj.population ) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * Deletes objects of the given array that don't have entries for 
 * life, gdp, and population.
 */
function deleteIncompletes(model) {
    let index = 0;
    model.forEach(row => {
        if( !hasAllThree(row) ) {
            model.splice(index, 1);
        }
        index++;
    })
}