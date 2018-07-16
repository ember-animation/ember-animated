# Transitions

Transitions define or customize how motions will be applied to one or more categories of sprites. In other words, transitions connect each sprite to a motion. Transitions are async and therefore interruptable, and use ember concurrency. Transitions run every time the state of the sprites changes, therefore they must be implemented as generator functions. There are two built-in transitions, `fade` and `moveOver` (see [Built In Transitions](../docs/built-in-transitions)). To use these transitions, you simply import them, then pass them into your template. You can also implement your own transitions. 


{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs'}}
    {{demo.snippet 'transitions-snippet.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}




