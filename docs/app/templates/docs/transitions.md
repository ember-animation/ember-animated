# Transitions

A transition tells sprite categories how to animate from one state to another. For example, a transition can assign the `fade` motion to all `insertedSprites`. Each time a sprite gets added to a list, it would fade into the list as that sprite went from its initial to its final state. 

Ember-animated has some built-in transitions, like `fade` and `moveOver`. To use the built in transitions, import `fade` or `moveOver` and then pass them into your template.

Transitions are interruptible and they run every time the state of a sprite changes. Also, this means that the state of a sprite can change during a transition. For example, if a user clicks an "undo" button as a sprite is changing states, the animation can reverse and the sprite could move back to its previous position. 



### Fade

In this demonstration, the message fades in or it fades out as it changes states. When the checkbox is checked or unchecked the state of the message changes. This change causes the transition to run. Try checking and unchecking the box yourself to watch the message animate in both directions!

<DocsDemo as |demo|>
  <demo.example @name="fade">
    <TransitionsFade />
  </demo.example>

  <demo.snippet @name="transitions-fade-snippet.hbs" @label="transitions-fade.hbs" />
  <demo.snippet @name="transitions-fade-snippet.js" @label="transitions-fade.js" />
  <demo.snippet @name="transitions-snippet.css" />
</DocsDemo>


### moveOver

`moveOver` comes with four options: `toLeft`, `toRight`, `toUp`, and `toDown`. `toLeft` and `toRight` are demonstrated here, using `rules` to compare two messages and choose a transition. For more on `rules` see [Data-Dependent Rules](../docs/rules/).

<DocsDemo as |demo|>
  <demo.example @name="moveover">
    <TransitionsMoveover />
  </demo.example>

  <demo.snippet @name="transitions-moveover-snippet.hbs" @label="transitions-moveover.hbs" />
  <demo.snippet @name="transitions-moveover-snippet.js" @label="transitions-moveover.js" />
  <demo.snippet @name="move-over-snippet.css" />
</DocsDemo>


### Custom 

You can also create your own transitions. `slideFromSide` is a custom transition that assigns motions to `insertedSprites`, `keptSprites`, and `removedSprites`. The message will slide to and from the side when the button is selected. 

<DocsDemo as |demo|>
  <demo.example @name="custom">
    <TransitionsExample />
  </demo.example>

  <demo.snippet @name="transitions-snippet.hbs" @label="transitions-example.hbs" />
  <demo.snippet @name="transitions-snippet.js" @label="transitions-example.js" />
  <demo.snippet @name="transitions-snippet.css" />
</DocsDemo>
