# Motions

A motion is responsible for animating a single sprite and taking into account whatever motions were previously running on that sprite. The difference between a motion and a transition is that a motion defines how a category of sprites will animate, while a transition defines how this motion will be applied. Motions represent the change in state or category of a sprite, and they manage continuity from one animation to the next. Every category of sprite is assigned a motion. Because all sprites are apart of a list, multiple states can exist simultaneously and motion functions return promises. Each motion takes a sprite as the first argument and options as the second argument. Like transitions, you may use any of the built in motions or implement your own. (As you may have noticed in [Transitions](../docs/transitions) the custom transition `slideFromSide` uses `move`).


### move
Animates a sprite from its current position to its final position.

### moveSVG
Similar to `move` except this motion animates on scalable vector grahic elements. 

### opacity
Animates a sprite from its inital to its final opacity (from %0 to %100 and vice versa).

### resize
Animates the adjustment of the height and width of a sprite relative to its environment.

### scale
Animates the adjustment of the height and width of sprite relative to the factor of the initial and final bounds. 

### compensateForScale
-------------

### follow
---------


### adjustColor
Animates the change in color of a sprite.

### adjustCSS
Animates the change in style of a sprite. 
