# Motions

A motion animates the change in an attribute value of a single sprite. Each motion takes a sprite as the first argument and options as the second argument. Motions can also have `to` and `from` arguments. These arguments take initial and final attribute values of the sprite. Motions animate the change of the given attribute from its initial to its final value. You may use any of the following built in motions or create your own. 

Motions are useful when you want to animate the change in a particular attribute of a sprite such as size, opacity, scale, color, etc. For example, if a sprite is changing color from red to blue, a motion can be applied to smoothly animate the gradual shift from red to blue. Without a motion, the sprite would just abruptly switch from red to blue. 


### move
Animates a sprite from its current position to its final position using css transforms. The only option argument it takes is `easing`. Because this motion works with `keptSprites`, it requires the starting and the ending position of a sprite. 

<DocsDemo as |demo|>
  <demo.example @name="move">
    <TransitionsExample />
  </demo.example>

  <demo.snippet @name="transitions-snippet.hbs" @label="transitions-example.hbs" />
  <demo.snippet @name="transitions-snippet.js" @label="transitions-example.js" />
  <demo.snippet @name="transitions-snippet.css" />
</DocsDemo>

### moveSVG

Ember-animated works for SVGs too! An SVG is an image format made of xml. Many vector illustration programs can export SVGs. `moveSVG` animates one property on a svg element. This motion takes in an attribute name and animates that attribute from its initial to its final value. For example, on a circle `moveSVG` animates the `cx` property.

<DocsDemo as |demo|>
  <demo.example @name="svg">
    <SvgExample />
  </demo.example>

  <demo.snippet @name="svg-snippet.hbs" @label="svg-example.hbs" />
  <demo.snippet @name="svg-snippet.js" @label="svg-example.js" />
</DocsDemo>

### opacity
Animates a sprite from its inital to its final opacity (from %0 to %100 and vice versa). Takes `from` and `to` arguments. With no arguments, this motion uses the default initial and final opacity of the sprite. `fadeIn` and `fadeOut` export from the same module. `fadeIn` animates sprite from 0% to 100% opacity (0 to 1), while `fadeOut` does the reverse. 

<DocsDemo as |demo|>
  <demo.example @name="opacity">
    <OpacityDemo />
  </demo.example>

  <demo.snippet @name="opacity-demo-snippet.hbs" @label="opacity-demo.hbs" />
  <demo.snippet @name="opacity-demo-snippet.js" @label="opacity-demo.js" />
</DocsDemo>

### resize
Animates the height and width of a sprite. The height and width can be length values such as px or cm, or a percentage of the containing block. Expects the initial and final state of the sprite. This is the default motion used by animated-container. Consider using `scale` instead because `scale` uses css transforms and will not trigger reflow. See [More on Reflow](https://developers.google.com/web/fundamentals/design-and-ux/animations/animations-and-performance).

### scale
Applies css transforms to animate the initial size of a sprite into the final size. 

## Adjustment Motions

### compensateForScale
This motion is useful when moving a sprite into or out of an area of a page that has a css scaling transform applied. Ensures that the scale changes smoothly during the animation. 

### adjustColor
Animates the change in value of the css color attribute of a sprite, such as `rbg(211, 211, 211)`. The `from` argument takes a css color, otherwise it defaults to the `measuredInitial` color and animates to the default final color. 

### adjustCSS
Animates the change in style of a sprite. Applies to css properties that are a unit and a number (font-size, letter spacing).

<DocsDemo as |demo|>
  <demo.example @name="moving-word">
    <MovingWordText />
  </demo.example>

  <demo.snippet @name="moving-word-text-snippet.hbs" @label="moving-word-text.hbs" />
  <demo.snippet @name="moving-word-snippet.hbs" @label="moving-word.hbs" />
  <demo.snippet @name="moving-word-snippet.js" @label="moving-word.js" />
  <demo.snippet @name="moving-word-snippet.css" />
</DocsDemo>
