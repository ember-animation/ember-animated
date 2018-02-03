import Route from '@ember/routing/route';
import Papa from 'papaparse';

export default Route.extend({

    async model() {
        let stringFromFile = await loadText('chart_model_data.txt'); // a JSON string
        let model = JSON.parse(stringFromFile);
        return model;
      }
});

/********
Concatonates the 'country' and 'year' key values into one key.
The new key is 'countryYear'. Each entry in the model array
will have this new key in replace of the 'country' and 
'year' keys.
********/
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

/********
    Creates an array of objects with data parsed from .csv files.
    Returns this array as a JSON string.
    This function was called once to create model_data.txt which stores 
    the JSON string of the data needed to run the route.
    Now that the file exists, this function is no longer called.
********/
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