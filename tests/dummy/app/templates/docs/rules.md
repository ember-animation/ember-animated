# Rules for Data-Dependent Animations

The `rules` argument chooses which `transition` to run when the data changes in the list that is being animated. To do this, `rules` compares the new data value to the old data value (`oldList` and `newList`). If a component has `rules` and a `transition`, the `rules` will take precedence over the `transition`. 

In this demonstration, the `rules` argument determines which transition will run when the number changes. When the number is incremented, the new data value or number is larger than the old data value, and the `toUp` transition is used. The opposite happens when the number is decremented, and the `toDown` transition is used when the old data value is larger than the new one. 

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{rules-example}}
    {{/demo.example}}

    {{demo.snippet 'rules-snippet.hbs' label='rules-example.hbs'}}
    {{demo.snippet 'rules-snippet.js' label='rules-example.js'}}
    {{demo.snippet 'rules-snippet.css'}}
{{/docs-demo}}

