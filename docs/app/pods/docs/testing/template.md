# Testing

This section will cover tools that you can use to test and debug an app that has animations.

Here are some common questions that the testing tools help address:

1. How can you make sure that animations do not slow down your tests?
2. How do you wait for animations to finish before making test assertions or snapshots?
3. How can you test app state partway through an animation?
4. What is the best way to debug animations that do not look how you expect them to?

## Animation duration in tests

If your app is full of animations with long durations, they could slow down your acceptance tests running in the browser.
One way to prevent this is to set a very fast duration in your `environment.js` for testing, and then use that duration as a default whenever you set an animation speed in your app's code:

```js
// environment.js

if (environment === 'test') {
  ENV.animationSpeed = 20;
}
```

```js
// some-component.js

import ENV from 'my-app-name/config/environment';
// ...more imports

export default class SomeComponent extends Component {
    let duration = ENV.animationSpeed || 500;

    *someAnimation({ keptSprites, receivedSprites }) {
    keptSprites.forEach(sprite => {
      move(sprite, { duration });
    });
  }

  // ...more component code
}
```

## Waiting for animations to finish

`ember-animated` provides a test helper called `animationsSettled()`, which you can use in tests to make sure that an animation is complete before moving on to the next step of the test.
This is especially useful for test suites that use visual snapshots such as Percy.

For examples of using this test helper and others, see the [acceptance tests for this addon](https://github.com/ember-animation/ember-animated/tree/master/tests/acceptance).

## Pausing animations

Sometimes, it is helpful to pause an in-progress animation in order to make a test assertion or take a snapshot.
You can use the `time.pause()` helper to accomplish this.

For examples of using this test helper and others, see the [acceptance tests for this addon](https://github.com/ember-animation/ember-animated/tree/master/tests/acceptance).


## Visual Debugging

Did you notice a problem with an animation you wrote?
One of the easiest ways to debug your animations is to slow them down and watch them while you click through the app.
You can install the [`ember-animated-tools`](https://github.com/ember-animation/ember-animated-tools) addon, which provides an interactive component that lets you control how quickly the animations run.
See the project README for more information about how to use the addon.
