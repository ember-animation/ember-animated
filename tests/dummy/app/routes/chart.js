import Route from '@ember/routing/route';
import Papa from 'papaparse';



export default Route.extend({

    async model() {
        let pop = await loadcsv(`population.csv`);

        let model = [];
        
        // forEachColumn( pop, (country, year, population) =>
        //     model.push({country, year, population})
        // )

        // let gdp = await loadcsv(`gdp_per_capita_ppp.csv`);


        // forEachColumn(gdp, (country, year, gdp) => {
        //     let datapoint = model.find(p => 
        //         p.country === country && p.year === year);
        //     if(datapoint) {
        //         datapoint.gdp = gdp;
        //     }
        // })

        // let life = await loadcsv(`life_expectancy_at_birth.csv`);

        // forEachColumn(life, (country, year, life) => {
        //     let datapoint = model.find(p => 
        //         p.country === country && p.year === year);
        //     if(datapoint) {
        //         datapoint.life = life;
        //     }
        // })

        // model now is an array of objects. Each entry is structured thusly:
        // {country: "Japan", year: "1988", population: "121432942", gdp: "26724", life: "78.54"}
        
        model = [
            {country: "Albania", year: "2014", population: "2889676", gdp: "10160", life: "77.9"},
            {country: "Cayman Islands", year: "1988", population: "22539", gdp: "52376"},
            {country: "Georgia", year: "1989", population: "5466610", gdp: "9379", life: "69.95"}
        ];
        let newkey = model[0].country + model[0].year;
        let newobj = { population: model[0].population};

        return newkey;
      }

});

async function loadcsv(url) {
    let response = await fetch(url)
    let text = await response.text();
    return Papa.parse(text, {header: true}).data;
}

function forEachColumn(rows, body) {
    rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if(row[key] && key !== 'country'){
                body(row.country, key, row[key])
            }
        })
    })
}

// function concatCountryYear(model) {
//     model.forEach(row => {
        
//     })
// }

// Object.keys(row).forEach(key => {
            
// })


// o[ new_key ] = o[ old_key ];
// delete o[ old_key ];

// if (old_key !== new_key) {
//     Object.defineProperty(o, new_key,
//         Object.getOwnPropertyDescriptor(o, old_key));
//     delete o[old_key];
// }