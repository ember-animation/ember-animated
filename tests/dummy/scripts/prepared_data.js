/* eslint-env node */
let Papa = require('papaparse');
let fs = require('fs');

/**
 * Creates an array of objects with data parsed from .csv files.
 * Returns this array as a JSON string.
 * This function was called once to create model_data.txt to store 
 * the JSON string of the data needed to run the route.
 * Now that the file exists, this function is no longer called.
 */
function makeJSON() {
    let model = [];
    let pop = loadcsv(`../public/population.csv`);
    forEachColumn( pop, (country, year, population) =>
        model.push({country, year, population})
    )
    let gdp = loadcsv(`../public/gdp_per_capita_ppp.csv`);
    forEachColumn(gdp, (country, year, gdp) => {
        let datapoint = model.find(p => 
            p.country === country && p.year === year);
        if(datapoint) {
            datapoint.gdp = gdp;
        }
    })
    let life = loadcsv(`../public/life_expectancy_at_birth.csv`);
    forEachColumn(life, (country, year, life) => {
        let datapoint = model.find(p => 
            p.country === country && p.year === year);
        if(datapoint) {
            datapoint.life = life;
        }
    })
    model = deleteIncompletes(model);
    return JSON.stringify(model);
}
 function loadcsv(file) {
    let text =  fs.readFileSync(file, 'utf8');
    return Papa.parse(text, {header: true}).data;
}

function forEachColumn(rows, body) {
    rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if(row[key] && key !== 'country'){
                body(row.country, parseInt(key, 10), parseInt(row[key], 10));
            }
        })
    })
}

/**
 * Does given object contain the properties life, gdp, and population?
 * If yes, return true. If no, return false.
 */
function hasAllThree(countryYearObj) {
    return countryYearObj.life != null && 
           countryYearObj.gdp != null && 
           countryYearObj.population != null;
}

/**
 * Deletes objects of the given array that don't have entries for 
 * life, gdp, and population.
 */
function deleteIncompletes(model) {
    return model.filter(hasAllThree);
}

fs.writeFileSync('../public/chart_model_data.json', makeJSON(), 'utf8');