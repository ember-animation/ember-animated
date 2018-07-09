# Transitions

Transitions define or customize how motions will be applied to one or more categories of sprites. In other words,transitions connect each sprite to a motion. Transitions are async and therefore interruptable, and use ember concurrency. This is an example of a simple transition that applies the motion `move` to each sprite where the category of sprites is kept.


```js
import move from 'ember-animated/motions/move';

export default Controller.extend({
  transition: function * ({ keptSprites }) {
    keptSprites.forEach(move);
  },
});
```