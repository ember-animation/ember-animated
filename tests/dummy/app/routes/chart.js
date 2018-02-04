import Route from '@ember/routing/route';


export default Route.extend({

    async model() {
        let model = await loadJSON('chart_model_data.json'); 
        return model;
      }
});


async function loadJSON(url) {
    let response = await fetch(url);
    let text = await response.json();
    return text;
}



