# Motions

A motion is responsible for animating a single sprite while taking into account whatever motions were previously running on that sprite. Transitions are composed out of motions, looks at different categories of sprites and assigns motions to it. //The difference between a motion and a transition is that a motion defines how a category of sprites will animate, while a transition defines how this motion will be applied.\\ Motions represent the change in state or category of a sprite, and they manage continuity from one animation to the next. Each motion takes a sprite as the first argument and options as the second argument. Like transitions, you may use any of the built in motions or implement your own. (As you may have noticed in [Transitions](../docs/transitions) the custom transition `slideFromSide` uses `move`). 


### move
Animates a sprite from its current position to its final position using css transforms. The only option it takes is easing. Because this motion works with kept sprites, it requires the initial and final state of a sprite. 


{{#docs-demo as |demo|}}
    {{#demo.example name="move"}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs'}}
    {{demo.snippet 'transitions-snippet.js' label='component.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}

### moveSVG
Animates one property on a svg element. This motion takes in an attribute name and animates that attribute from its initial to its final value. For example, on a circle movesvg property cx.

{{#docs-demo as |demo|}}
    {{#demo.example name="svg"}}
        {{svg-example}}
    {{/demo.example}}

    {{demo.snippet 'svg-snippet.js' label='component.js'}}
    {{demo.snippet 'svg-snippet.hbs'}}
{{/docs-demo}}


### opacity
Animates a sprite from its inital to its final opacity (from %0 to %100 and vice versa). Takes from and to arguments. With no arguments, this motion uses the default initial and final opacity of the sprite. fadeIn and fadeOut export from the same module.

### resize
Animates the height and width of a sprite. Expects the initial and final state of the sprite. This is the default motion used by animated-container. Consider using scale instead because scale uses css transforms and will not trigger reflow. (link?)

### scale
Applies css transforms to animate the initial size of the sprite into the final size. 

### adjustColor
Animates the change in color of a sprite. The from argument takes a css color, otherwise it defaults to the measuredInitial color and animates to the default final color. 

### adjustCSS
Animates the change in style of a sprite. Applies to css properties that are a unit and a number (font-size, letter spacing). Attribute method 

### compensateForScale
Sprite animating into or out of an area of the page that has scaling applied.

