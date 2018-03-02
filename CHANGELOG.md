# master

 - BREAKING: removed waitForAnimations in favor of animationsSettled. It works better with new style async Ember tests.
 - BREAKING: transitions now received the TransitionContext as an argument instead of as `this`.
 - BREAKING: the TransitionContext no longer has an `animate` method. Instead, Motions are defined to export functions that automatically animate.
 - BREAKING: the signature for defining a Motion has changed. By convention, your default export should be function that creates and starts the motion, and you should also offer a named export for your Motion subclass so that others can extend from it.
 - BREAKING: rules functions get named arguments instead of positional arguments.
 - BREAKING: renamed animated-bind component to animated-value. "bind" made sense in the context of early Ember, it's not really a thing people say anymore.
 - ENHANCEMENT: rules functions get an additional argument, "use", which is the same `use` parameter that was passed to animator component. This lets us have some generic rules functions like `ember-animated/rules/always` and `ember-animated/rules/after-initial-render`.
 - BREAKING: the default rules have changed from `always` to `after-initial-render` because that is by far the common case.
 - BREAKING: moved around many internal modules to make it clear what things are publicy importable. 


# v0.0.1-alpha.0

First tagged released
