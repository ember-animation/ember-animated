# Rules for Data-Dependent Animations

The `rules` argument chooses which `transition` to run when the data changes. If a component has `rules` and a `transition`, the `rules` take precedence over `transition`. 

In this demonstration, a transition will run based on `rules` when the numbers change by incrementing or decrementing the counter value. `rules` compares the values of an old list to the values of a new list, where the old list is the previous number value and the new list is the incoming number value (every element in itself is a list). Based on these values, the counter will animate up, or down.

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{rules-example}}
    {{/demo.example}}

    {{demo.snippet 'rules-snippet.hbs'}}
    {{demo.snippet 'rules-snippet.js'}}
    {{demo.snippet 'rules-snippet.css'}}
{{/docs-demo}}

