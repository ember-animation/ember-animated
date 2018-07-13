# Transitions

Transitions define or customize how motions will be applied to one or more categories of sprites. In other words, transitions connect each sprite to a motion. Transitions are async and therefore interruptable, and use ember concurrency. There are two built-in transitions, `fade` and `moveOver` (see [Built In Transitions](../docs/built-in-transitions)). To use these transitions, you simply import them into your js file and pass them into your template. You can also implement your own transitions. Transitions run every time the state of the sprites changes, therefore transitions must be implemented as generator functions. 

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs'}}
    {{demo.snippet 'transitions-snippet.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}




