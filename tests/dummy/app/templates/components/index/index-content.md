# Motivation

Ember Animated provides robust, composable animation components. It follows some core principles:

 -  animation is a _presentation_ concern that shouldn't feed back into your app's logic. Your app's features and your animation logic should be clearly separated.
 -  when animation is separate from app logic, it becomes more shareable and reusable.
 -  motion must adapt dynamically to different data, different devices, and new app features. Hand-designed motions are brittle. Motions that _emerge_ from general principles are robust.
 -  animating components need to cooperate with each other so that motions compose correctly. If animators can't nest and interact, they're not practical for complex applications.

This presentation covers the overall philosophy and demonstrates some of the capabilities:

<iframe width="560" height="315" src="https://www.youtube.com/embed/4JofVQ3nGrw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

<div class="my-16 text-right">
  {{#link-to 'docs' class='bg-grey-darkest hover:bg-black text-white py-2 px-4 no-underline rounded'}} Read the Docs {{/link-to}}
</div>

