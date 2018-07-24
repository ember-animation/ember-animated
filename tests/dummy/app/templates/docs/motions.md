# Motions

A motion is responsible for animating a single sprite. Each motion takes a sprite as the first argument and options as the second argument. Motions can also have `to` and `from` arguments that take an initial and final attribute value of a sprite to animate. Motions represent the change in state or category of a sprite, and they manage continuity from one animation to the next. Transitions are composed out of motions because they look at different categories of sprites and assigns motions to them. Like transitions, you may use any of the built in motions or implement your own. 


### move
Animates a sprite from its current position to its final position using css transforms. The only option argument it takes is `easing`. Because this motion works with kept sprites, it requires the initial and final state of a sprite. 

{{#docs-demo as |demo|}}
    {{#demo.example name="move"}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs'}}
    {{demo.snippet 'transitions-snippet.js' label='component.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}

### moveSVG
Animates one property on a svg element. This motion takes in an attribute name and animates that attribute from its initial to its final value. For example, on a circle `moveSVG` animates the `cx` property.

{{#docs-demo as |demo|}}
    {{#demo.example name="svg"}}
        {{svg-example}}
    {{/demo.example}}

    {{demo.snippet 'svg-snippet.js' label='component.js'}}
    {{demo.snippet 'svg-snippet.hbs'}}
{{/docs-demo}}


### compensateForScale
Animates a sprite moving into or out of an area of a page that has scaling applied.

### adjustColor
Animates the change in color of a sprite. The `from` argument takes a css color, otherwise it defaults to the  `measuredInitial` color and animates to the default final color. 

### adjustCSS
Animates the change in style of a sprite. Applies to css properties that are a unit and a number (font-size, letter spacing).

{{#docs-demo as |demo|}}
    {{#demo.example name="moving-word"}}
        {{moving-word-text}}
    {{/demo.example}}

    {{demo.snippet 'moving-word-snippet.js' label='component.js'}}
    {{demo.snippet 'moving-word-snippet.hbs'}}
    {{demo.snippet 'moving-word-snippet.css'}}
    {{demo.snippet 'moving-word-text-snippet.js' label='component.js'}}
    {{demo.snippet 'moving-word-text-snippet.hbs'}}
{{/docs-demo}}


### opacity
Animates a sprite from its inital to its final opacity (from %0 to %100 and vice versa). Takes `from` and `to` arguments. With no arguments, this motion uses the default initial and final opacity of the sprite. `fadeIn` and `fadeOut` export from the same module.

### resize
Animates the height and width of a sprite. Expects the initial and final state of the sprite. This is the default motion used by animated-container. Consider using `scale` instead because `scale` uses css transforms and will not trigger reflow. 

### scale
Applies css transforms to animate the initial size of a sprite into the final size. 