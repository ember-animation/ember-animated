# Rules for Data-Dependent Animations

`rules` can be defined when you want to use different animated transitions under different conditions. To do this, `rules` compare the new data value to the old data value (`oldList` and `newList`). If a component has `rules` and a `transition`, the `rules` will take precedence over the `transition`. 

In this demonstration, the `rules` choose a transition based on the number in the counter. When the counter increments, the new number is larger than the old number so the `toUp` transition runs. When the counter decrements, the old number is larger than the new one and and the `toDown` transition runs. 

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{rules-example}}
    {{/demo.example}}

    {{demo.snippet 'rules-snippet.hbs' label='rules-example.hbs'}}
    {{demo.snippet 'rules-snippet.js' label='rules-example.js'}}
    {{demo.snippet 'rules-snippet.css'}}
{{/docs-demo}}

