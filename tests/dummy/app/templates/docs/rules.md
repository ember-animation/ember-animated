# Rules for Data-Dependent Animations

`rules` choose which `transition` to run when data changes in a list that is being animated. To do this, `rules` compares the new data value to the old data value (`oldList` and `newList`). If a component has `rules` and a `transition`, the `rules` will take precedence over the `transition`. 

In this demonstration, the `rules` determine which transition will run when the number changes. When the number is incremented, the new number is larger than the old number so the `toUp` transition is used. This transition was chosen after the incoming and the outgoing number values were compared, as they are the data in the list being animated. The opposite happens when the number is decremented, and the `toDown` transition is used when the old number is larger than the new one. 

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{rules-example}}
    {{/demo.example}}

    {{demo.snippet 'rules-snippet.hbs' label='rules-example.hbs'}}
    {{demo.snippet 'rules-snippet.js' label='rules-example.js'}}
    {{demo.snippet 'rules-snippet.css'}}
{{/docs-demo}}

