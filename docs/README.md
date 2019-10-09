# ember-animated-docs

This is the documentation app for Ember Animated.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

PAY ATTENTION here, this is slightly different than a normal Ember app.

* `git clone <repository-url>` this repository
* `cd ember-animated`
* `yarn install` (this is needed because the app depends on the library)
* `cd docs`
* `yarn install` (this is needed because the app has its own dependencies too)
* `ember s`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4201](http://localhost:4201).
* Visit your tests at [http://localhost:4201/tests](http://localhost:4201/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

This app gets deployed automatically via TravisCI using ember-cli-deploy.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
