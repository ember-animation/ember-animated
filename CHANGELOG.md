# 0.1.0

 - BREAKING: removed waitForAnimations in favor of animationsSettled. It works better with new style async Ember tests.
 - BREAKING: transitions now received the TransitionContext as an argument instead of as `this`.
 - BREAKING: the TransitionContext no longer has an `animate` method. Instead, Motions are defined to export functions that automatically animate.
 - BREAKING: the signature for defining a Motion has changed. By convention, your default export should be function that creates and starts the motion, and you should also offer a named export for your Motion subclass so that others can extend from it.
 - BREAKING: rules functions get named arguments instead of positional arguments.
 - BREAKING: renamed animated-bind component to animated-value. "bind" made sense in the context of early Ember, it's not really a thing people say anymore.
 - BREAKING: we only provide insertedSprites at initial render if you set initialInsertion=true. Received sprites are always still provided, because that's what they're for.
 - BREAKING: moved around many internal modules to make it clear what things are publicy importable. 
 - BREAKING: rename the default cosine-based easing function from `inAndOut` to `easeInAndOut` for consistency with `easeIn` and `easeOut`.
 - BREAKING: the built-in `scale` motion now adjusts initial scale correctly. Previously you needed to do it manually, but now we can make it automatic using Sprite's originalInitialBounds and originalFinalBounds.



# v0.0.1-alpha.0

First tagged released
