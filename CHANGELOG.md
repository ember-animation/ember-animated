

## v1.1.0 (2023-11-22)

#### :rocket: Enhancement
* [#625](https://github.com/ember-animation/ember-animated/pull/625) add support for @ember/test-helpers v3 ([@SergeAstapov](https://github.com/SergeAstapov))
* [#613](https://github.com/ember-animation/ember-animated/pull/613) Introduce Glint types ([@SergeAstapov](https://github.com/SergeAstapov))
* [#615](https://github.com/ember-animation/ember-animated/pull/615) Widen range of ember-element-helper versions ([@SergeAstapov](https://github.com/SergeAstapov))
* [#607](https://github.com/ember-animation/ember-animated/pull/607) remove engines.node from addon's package.json ([@SergeAstapov](https://github.com/SergeAstapov))

#### :bug: Bug Fix
* [#606](https://github.com/ember-animation/ember-animated/pull/606) Fix types for modern TS ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#619](https://github.com/ember-animation/ember-animated/pull/619) Update docs to use and recommend inline-block ([@tcjr](https://github.com/tcjr))
* [#466](https://github.com/ember-animation/ember-animated/pull/466) move *.md files to repo root and copy via release-it hook ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#617](https://github.com/ember-animation/ember-animated/pull/617) `npx ember-cli-update --to=v5.3.0` in test-app ([@SergeAstapov](https://github.com/SergeAstapov))
* [#624](https://github.com/ember-animation/ember-animated/pull/624) Add 4.8 and 4.12 ember-try scenarios ([@SergeAstapov](https://github.com/SergeAstapov))
* [#620](https://github.com/ember-animation/ember-animated/pull/620) `npx ember-cli-update --to=v5.3.0` in docs ([@SergeAstapov](https://github.com/SergeAstapov))
* [#608](https://github.com/ember-animation/ember-animated/pull/608) replace publish-unstable workflow with push-dist ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 4
- Jan Werkhoven 岩 ([@janwerkhoven](https://github.com/janwerkhoven))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- Tom Carter ([@tcjr](https://github.com/tcjr))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## v1.0.3 (2022-04-28)

#### :rocket: Enhancement
* [#457](https://github.com/ember-animation/ember-animated/pull/457) Replace use of RSVP with native Promise ([@SergeAstapov](https://github.com/SergeAstapov))

#### :bug: Bug Fix
* [#458](https://github.com/ember-animation/ember-animated/pull/458) Allow multiple beacons with the same name ([@mattmarcum](https://github.com/mattmarcum))

#### :memo: Documentation
* [#464](https://github.com/ember-animation/ember-animated/pull/464) Replace faker with @faker-js/faker ([@muziejus](https://github.com/muziejus))
* [#461](https://github.com/ember-animation/ember-animated/pull/461) Improve contributing docs ([@SergeAstapov](https://github.com/SergeAstapov))
* [#459](https://github.com/ember-animation/ember-animated/pull/459) Use angle bracket syntax for `<DocsLink>` ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#462](https://github.com/ember-animation/ember-animated/pull/462) Publish to npm from CI ([@SergeAstapov](https://github.com/SergeAstapov))
* [#460](https://github.com/ember-animation/ember-animated/pull/460) run `npx ember-cli-update --to=4.3.0` to align with blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#446](https://github.com/ember-animation/ember-animated/pull/446) Simplify type checking workflow ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 3
- Moacir P. de Sá Pereira ([@muziejus](https://github.com/muziejus))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- strangelooper ([@mattmarcum](https://github.com/mattmarcum))

## v1.0.2 (2022-04-16)

#### :rocket: Enhancement
* [#454](https://github.com/ember-animation/ember-animated/pull/454) Make TransitionContext type export public ([@SergeAstapov](https://github.com/SergeAstapov))
 
#### :bug: Bug Fix
* [#453](https://github.com/ember-animation/ember-animated/pull/453) Fix compatibility with ember-element-helper@0.6.1 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :memo: Documentation
* [#444](https://github.com/ember-animation/ember-animated/pull/444)  move `.md` files to published package ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#445](https://github.com/ember-animation/ember-animated/pull/445) Remove `treePaths.addon` override ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 3
- Edward Faulkner ([@ef4](https://github.com/ef4))
- Peter Wagenet ([@wagenet](https://github.com/wagenet))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v1.0.1 (2022-03-28)

#### :rocket: Enhancement
* [#430](https://github.com/ember-animation/ember-animated/pull/430) Convert to TS and Improve Types ([@wagenet](https://github.com/wagenet))

#### :bug: Bug Fix
* [#432](https://github.com/ember-animation/ember-animated/pull/432) Fix TypeScript types paths ([@SergeAstapov](https://github.com/SergeAstapov))

#### :memo: Documentation
* [#427](https://github.com/ember-animation/ember-animated/pull/427) Update documentation around using pnpm instead of yarn ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#434](https://github.com/ember-animation/ember-animated/pull/434) Enable `consistent-type-imports` eslint rule ([@SergeAstapov](https://github.com/SergeAstapov))
* [#433](https://github.com/ember-animation/ember-animated/pull/433) Sort .eslintrc.js rules ([@SergeAstapov](https://github.com/SergeAstapov))
* [#416](https://github.com/ember-animation/ember-animated/pull/416) Move `dependenciesMeta.*.injected` config to `ember-try` ([@SergeAstapov](https://github.com/SergeAstapov))
* [#428](https://github.com/ember-animation/ember-animated/pull/428) Use upstream ember-animated-tools ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 2
- Peter Wagenet ([@wagenet](https://github.com/wagenet))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v1.0.0 (2022-03-18)

#### :boom: Breaking Change
* [#397](https://github.com/ember-animation/ember-animated/pull/397) V2 addon ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* [#423](https://github.com/ember-animation/ember-animated/pull/423) Replace usage of `this.element` with test helpers ([@SergeAstapov](https://github.com/SergeAstapov))
* [#426](https://github.com/ember-animation/ember-animated/pull/426) Add `publishConfig.registry` to addon/package.json ([@SergeAstapov](https://github.com/SergeAstapov))
* [#419](https://github.com/ember-animation/ember-animated/pull/419) Run `npx ember-cli-update --to=v4.2.0` to align with the latest bluep… ([@SergeAstapov](https://github.com/SergeAstapov))
* [#400](https://github.com/ember-animation/ember-animated/pull/400) Remove unused BEGIN-SNIPPET/END-SNIPPET from test-app ([@SergeAstapov](https://github.com/SergeAstapov))
* [#388](https://github.com/ember-animation/ember-animated/pull/388) Convert addon setup to monorepo ([@SergeAstapov](https://github.com/SergeAstapov))
* [#370](https://github.com/ember-animation/ember-animated/pull/370) Run `npx ember-cli-update --to=4.1.0` to sync with the latest blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#377](https://github.com/ember-animation/ember-animated/pull/377) Disable TypeScript scenarios for now ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 1
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

# 0.12.0
 - BREAKING: drop support for Node < 12
 - BREAKING: drop support for Ember < 3.16
 - COMPATABILITY: many updates for compatibility with Ember 4+ and Embroider by @SergeAstapov

# 0.11.0
 - HOUSEKEEPING: fix lint error in demo code by @balinterdi
 - HOUSEKEEPING: update CI config for PRs by SergeAstapov
 - HOUSEKEEPING: update the ember-element-helper version to eliminate warning under embroier by @lukemelia
 - ENHANCEMENT: allow easings to overshoot by @nibynic
 - BUGFIX: polyfill was breaking under fastboot by @madnificent

# 0.10.1

 - BUGFIX: polyfill DOMRect on browsers that don't have it, by @SergeAstapov
 - DOCS: fixes to one of the demos by @akashdsouza
 - HOUSEKEEPING: ported more internals to typescript
 - ENHANCEMENT: improved warning message by @rwwagner90
 - HOUSEKEEPING: switched to github actions for CI
 - HOUSEKEEPING: upgraded many devDependencies

# 0.10.0
 - BREAKING: drop support for Ember < 3.8
 - BREAKING: drop support for node 6.
 - BREAKING: Sprite#applyStyles no longer automatically corrects CSS property names from camel case to dasherized form. Always use the names as written in plain CSS.
 - BREAKING: Sprite#applyStyles no longer automatically adjusts non-string values to add units where appropriate. Always pass complete string values for your CSS properties.
 - BREAKING: Sprite#initialBounds, Sprite#finalBounds, and the bounds-returning test helpers are all now true DOMRect instances, as opposed to custom POJOs with the same fields. This can alter your results because the properties on DOMRect are non-enumerable.
 - BREAKING: we no longer export `Promise` from "ember-animated". In the environments where Ember Animated actually works, we always exported the native `Promise` anyway. We just used this as a place to check for native `Promise` support. This is awkward for TypeScript users, because the compiler reserves the name `Promise` in any file that has async functions.
 - HOUSEKEEPING: the docs are now a totally standalone app in the /docs subdirectory, as opposed to using the addon's dummy app. This lets us be more strict in the addon's test suite without involving all the complexities of the docs app.
 - ENHANCEMENT: `{{#animated-each}}` now supports an `{{else}}` block just like Ember's normal `{{#each}}`. By @esbanarango.
 - BREAKING: AnimatedContainer no longer accepts `@class=`, use `class=` instead. This had already been deprecated since 0.5.0.
 - HOUSEKEEPING: the bulk of our internals are now implemented in TypeScript.

# 0.9.0
 - BUGFIX: fix a flicker when interpolating colors near alpha zero.
 - ENHANCEMENT: add a boxShadow motion for interpolating shadows.
 - ENHANCEMENT: track border-color property by @bagby.

# 0.8.1
 - ENHANCEMENT: add padding- and border-radius-related CSS properties to the list of ones we track automatically
 - BUGFIX: animated-value didn't respect the `watch` parameter, by @bagby

# 0.8.0
 - BUGFIX: the classlist-resetting feature in the previous release had a bug that would prevent legitimate permanent updates to classes.
 - ENHANCEMENT: track border-radius properties so adjustCSS can easily interpolate radii.
 - DOCS: updates by @samselikoff
 - HOUSEKEEPING: update angle bracket invocation polyfill by @ryanto

# 0.7.0
 - ENHANCEMENT: sprites now reset their classlist after animating, so any classes applied by motions will be safely cleared at the end of animation.
 - BUGFIX: the identity transform used to serialized as "none", which can lead to unexpected behavior.
 - ENHANCEMENT: AnimatedContainer now accepts a `@tag` argument so you can customize which HTML Element it will render, by @ryanto. With this feature, users now have control over 100% of the DOM emitted by ember-animated.

# 0.6.1
 - BUGFIX: polyfill Element.remove on IE11
 - BUGFIX: subpixel rounding could cause text wrapping during animation of inline elements

# 0.6.0
 - BUGFIX: we sometimes threw a "function expected" Exception on Microsoft Edge when using <AnimatedOrphans />
 - DOCS: @jenweber fixed a broken link
 - BUGFIX: there was a race condition if any animator component received two changes before the first could even begin running the user's transition
 - HOUSEKEEPING: issue template added by @samselikoff
 - HOUSEKEEPING: deleted unnecessary package-lock.json by @Turbo87
 - DOCS: refer to yarn instead of NPM in the CONTRIBUTING docs, by @outdoorsy
 - HOUSEKEEPING: upgrade to Ember 3.10 and fix deprecations, by @cibernox
 - DOCS: improved use of `htmlSafe` in examples to demonstrate safer patterns
 - ENHANCEMENT: added easing option support to the scale motion, by @nibynic

# 0.5.4
 - HOUSEKEEPING: switch to released version of ember-angle-bracket-invocation-polyfill, by @danwenzel

# 0.5.3

 - HOUSEKEEPING: configure travis releases by @samselikoff

# 0.5.2

 - DOCS: major docs improvements by @samselikoff

# 0.5.1
 - COMPATIBILITY: update for compatibility with internal change to Ember 3.10 decorators, by @geoffreyd.

# 0.5.0
 - BREAKING CHANGE: changes the default duration from 2000 to 500
 - DEPRECATION: AnimatedContainer's "class" _argument_ is deprecated in favor of the class _attribute_. The old usage was

    ```hbs
    {{!-- these are exactly equivalent to each other --}}
    {{#animated-container class=something}}
    <AnimatedContainer @class={{something}}>
    ```

    The new usage is

    ```hbs
    <AnimatedContainer class={{something}}>
    ```

# 0.4.1
 - BUGFIX: previous style continuity feature was slightly too aggressive for line-height
 - BUGFIX: fix a crash when using SVGs as orphan sprites

# 0.4.0
 - ENHANCEMENT: improved style continuity for orphan sprites
 - DOCS: improved styling by @samselikoff

# 0.3.2
 - HOUSEKEEPING: compatibility with newer ember versions with help from @toovy and @cibernox
 - DOCS: sprite docs improvements by @samselikoff

# 0.3.1
 - ENHANCEMENT: new beacon API
 - DOCS: lots of new docs added, thanks @savvymas

# 0.3.0

 - ENHANCEMENT: now completely jQuery-free. Thanks to @cibernox and @mikoscz.
 - ENHANCEMENT: `animated-each` now yields an `index` variable, just like regular Ember `each`. Thanks @Cryrivers.
 - ENHANCEMENT: much progress on integrating ember-cli-addon-docs and beginning to document methods. Thanks @Oreoz, @Turbo87, @chrism. Deployed docs site coming very soon.

# 0.2.0

 - BREAKING: Sprite no longer has initialOpacity and finalOpacity. These are now covered by initialComputedStyle and finalComputedStyle, which are also extensible to track many other CSS properties.

 - BREAKING: orphaned transitions will no longer see removedSprites by default when the corresponding animator is being destroyed. It's usually not what you want. You can opt-in to animating removed sprites by setting finalRemoval=true on the animator (this is analogous to initialInsertion). None of this impacts an animator's ability to match against other animators, even when it's being destroyed (sentSprites are still always available).

# 0.1.0

 - BREAKING: removed waitForAnimations in favor of animationsSettled. It works better with new style async Ember tests.
 - BREAKING: transitions now received the TransitionContext as an argument instead of as `this`.
 - BREAKING: the TransitionContext no longer has an `animate` method. Instead, Motions are defined to export functions that automatically animate.
 - BREAKING: the signature for defining a Motion has changed. By convention, your default export should be function that creates and starts the motion, and you should also offer a named export for your Motion subclass so that others can extend from it.
 - BREAKING: rules functions get named arguments instead of positional arguments.
 - BREAKING: renamed animated-bind component to animated-value. "bind" made sense in the context of early Ember, it's not really a thing people say anymore.
 - BREAKING: we only provide insertedSprites at initial render if you set initialInsertion=true. Received sprites are always still provided, because that's what they're for.
 - BREAKING: moved around many internal modules to make it clear what things are publicly importable.
 - BREAKING: rename the default cosine-based easing function from `inAndOut` to `easeInAndOut` for consistency with `easeIn` and `easeOut`.
 - BREAKING: the built-in `scale` motion now adjusts initial scale correctly. Previously you needed to do it manually, but now we can make it automatic using Sprite's originalInitialBounds and originalFinalBounds.



# v0.0.1-alpha.0

First tagged released
