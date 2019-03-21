# Motivation

Ember Animated provides robust, composable animation components. It follows some core principles:

 -  Animation is a _presentation_ concern that shouldn't feed back into your app's logic. Your app's features and your animation logic should be clearly separated.

 -  When animation is separate from app logic, it becomes more shareable and reusable.

 -  Motion must adapt dynamically to different data, different devices, and new app features. Hand-designed motions are brittle. Motions that _emerge_ from general principles are robust.

 -  Animating components need to cooperate with each other so that motions compose correctly. If animators can't nest and interact, they're not practical for complex applications.
