# Motions

A motion animates a single sprite. Each motion takes a sprite as the first argument and options as the second argument. Motions can also have `to` and `from` arguments. These arguments take initial and final attribute values of the sprite. Motions animate the change of the given attribute from its initial to its final value. Like transitions, you may use any of the built in motions or create your own. 


### move
Animates a sprite from its current position to its final position using css transforms. The only option argument it takes is `easing`. Because this motion works with `keptSprites`, it requires the start point and the end point of a sprite. 

{{#docs-demo as |demo|}}
    {{#demo.example name="move"}}
      {{transitions-example}}
    {{/demo.example}}

    {{demo.snippet 'transitions-snippet.hbs' label='transitions-example.hbs'}}
    {{demo.snippet 'transitions-snippet.js' label='transitions-example.js'}}
    {{demo.snippet 'transitions-snippet.css'}}
{{/docs-demo}}

### moveSVG
Animates one property on a svg element. This motion takes in an attribute name and animates that attribute from its initial to its final value. For example, on a circle `moveSVG` animates the `cx` property.

{{#docs-demo as |demo|}}
    {{#demo.example name="svg"}}
        {{svg-example}}
    {{/demo.example}}

    {{demo.snippet 'svg-snippet.hbs' label='svg-example.hbs'}}
    {{demo.snippet 'svg-snippet.js' label='svg-example.js'}}
{{/docs-demo}}


### compensateForScale
Animates a sprite moving into or out of an area of a page that has scaling applied.

### adjustColor
Animates the change in color of a sprite. The `from` argument takes a css color, otherwise it defaults to the `measuredInitial` color and animates to the default final color. 

### adjustCSS
Animates the change in style of a sprite. Applies to css properties that are a unit and a number (font-size, letter spacing).

{{#docs-demo as |demo|}}
    {{#demo.example name="moving-word"}}
        {{moving-word-text}}
    {{/demo.example}}

    {{demo.snippet 'moving-word-text-snippet.hbs' label='moving-word-text.hbs'}}
    {{demo.snippet 'moving-word-text-snippet.js' label='moving-word-text.js'}}
    {{demo.snippet 'moving-word-snippet.hbs' label='moving-word.hbs'}}
    {{demo.snippet 'moving-word-snippet.js' label='moving-word.js'}}
    {{demo.snippet 'moving-word-snippet.css'}}
{{/docs-demo}}


### opacity
Animates a sprite from its inital to its final opacity (from %0 to %100 and vice versa). Takes `from` and `to` arguments. With no arguments, this motion uses the default initial and final opacity of the sprite. `fadeIn` and `fadeOut` export from the same module.

### resize
Animates the height and width of a sprite. Expects the initial and final state of the sprite. This is the default motion used by animated-container. Consider using `scale` instead because `scale` uses css transforms and will not trigger reflow. 

### scale
Applies css transforms to animate the initial size of a sprite into the final size. 
