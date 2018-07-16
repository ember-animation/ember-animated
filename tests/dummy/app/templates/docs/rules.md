# Rules for Data-Dependent Animations

The rules argument chooses which transition to run when the data changes. If a component has rules and a transition, the rules take precedence over the transition. 

In this demonstration, a transition will run based on `rules` when the numbers change by incrementing or decrementing the counter value. In this case, there are two rules, `rules` and `rules2`. Both sets of rules compare the values of an old list to the values of a new list, where the old list is the previous number value and the new list is the incoming number value (every element in itself is a list). Based on these values, the counters will animate up, down, left, or right.

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{bind-example}}
    {{/demo.example}}

    {{demo.snippet 'bind-snippet.hbs'}}
    {{demo.snippet 'bind-snippet.js'}}
    {{demo.snippet 'bind-snippet.css'}}
{{/docs-demo}}

