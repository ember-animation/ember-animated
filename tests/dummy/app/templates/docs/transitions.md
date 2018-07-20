# Transitions

Transitions define or customize how motions will be applied to one or more categories of sprites. In other words, transitions connect each sprite to a motion. Transitions are async and therefore interruptable, and use ember concurrency. Transitions run every time the state of the sprites changes, therefore they must be implemented as generator functions. There are two built-in transitions, `fade` and `moveOver`. To use these transitions, you simply import them, then pass them into your template. You can also implement your own transitions. 


### Fade

{{#docs-demo as |demo|}}
    {{#demo.example name="fade"}}
      {{transitions-fade}}
    {{/demo.example}}

    {{demo.snippet 'transitions-fade-snippet.hbs'}}
    {{demo.snippet 'transitions-fade-snippet.js' label='component.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}

### Custom 

{{#docs-demo as |demo|}}
    {{#demo.example name="custom"}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs'}}
    {{demo.snippet 'transitions-snippet.js' label='component.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}

### moveOver

{{#docs-demo as |demo|}}
  {{#demo.example name="moveover"}}
    {{transitions-moveover}}
  {{/demo.example}}

  {{demo.snippet 'transitions-moveover-snippet.js'}}
  {{demo.snippet 'transitions-moveover-snippet.hbs'}}
{{/docs-demo}}


