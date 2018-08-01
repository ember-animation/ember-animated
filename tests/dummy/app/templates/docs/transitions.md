# Transitions

Transitions assign each sprite to a motion. A transition tells sprite categories how to animate from one state to another. For example, a transition might assign the `fade` motion to all `insertedSprites` so that each time a sprite is added to a list, it fades into the list as that sprite changes states (from its initial state to its final state). 

Because transitions run every time the state of a sprite changes, they must be implemented as generator functions. This also means that transitions are async and interruptable, so the state of a sprite can be changed during a transition. Ember concurrency is used to support interruptions. 


`fade` and `moveOver` are built in transitions. To use the built in transitions, you simply import `fade` or `moveOver` and then pass them into your template.

In this demonstration, the message fades in or it fades out as it changes states. Each click of the button makes the state of the message change, causing the transition to run.

### Fade

{{#docs-demo as |demo|}}
    {{#demo.example name="fade"}}
      {{transitions-fade}}
    {{/demo.example}}

    {{demo.snippet 'transitions-fade-snippet.hbs' label='transitions-fade.hbs'}}
    {{demo.snippet 'transitions-fade-snippet.js' label='transitions-fade.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}


`moveOver` comes with four options: `toLeft`, `toRight`, `toUp`, and `toDown`. `toLeft` and `toRight` are demonstrated here, using `rules` to compare the two messages and determine which transition to use. For more on `rules` see [Rules for Data-Dependent Animations](../docs/rules/).

### moveOver

{{#docs-demo as |demo|}}
  {{#demo.example name="moveover"}}
    {{transitions-moveover}}
  {{/demo.example}}

  {{demo.snippet 'transitions-moveover-snippet.hbs' label='transitions-moveover.hbs'}}
  {{demo.snippet 'transitions-moveover-snippet.js' label='transitions-moveover.js'}}
{{/docs-demo}}


You can also implement your own transitions. `slideFromSide` is a custom transition that assigns specific motions to `insertedSprites`, `keptSprites`, and `removedSprites` so that the message will slide to and from the side when the button is clicked and unclicked. 
### Custom 

{{#docs-demo as |demo|}}
    {{#demo.example name="custom"}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs' label='transitions-example.hbs'}}
    {{demo.snippet 'transitions-snippet.js' label='transitions-example.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}
