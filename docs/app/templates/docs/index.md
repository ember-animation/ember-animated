# Overview

## Installation

To install Ember Animated, run

```sh
ember install ember-animated
```

## Usage in Template Tag Format

For usage in `gts` and `gjs`, `ember-animated` provides following import paths:

```gjs
import AnimatedBeacon from 'ember-animated/components/animated-beacon';
import AnimatedContainer from 'ember-animated/components/animated-container';
import animatedEach from 'ember-animated/components/animated-each';
import animatedIf from 'ember-animated/components/animated-if';
import AnimatedOrphans from 'ember-animated/components/animated-orphans';
import animatedValue from 'ember-animated/components/animated-value';

<template>
  <AnimatedBeacon @name="one" />
  <AnimatedOrphans/>

  <AnimatedContainer>
    {{#animatedIf this.showThing use=this.transition}}
      <div class="message" {{on "click" this.toggleThing}}>
        Hello!
      </div>
    {{/animatedIf}}
  </AnimatedContainer>

  <AnimatedContainer>
    {{#animatedEach this.items use=this.transition duration=2000 as |item|}}
      <div data-test-item={{item}} {{on "click" (fn this.removeItem item)}}>
        {{item}}
      </div>
    {{/animatedEach}}
  </AnimatedContainer>

  <AnimatedContainer>
    {{#animatedValue this.counter rules=this.rules duration=100 as |v|}}
      <span class="numbers">{{v}}</span>
    {{/animatedValue}}
  </AnimatedContainer>
</template>
```

Note that `animatedEach`, `animatedIf`, `animatedValue` are camelCase imports as those are control structures
whereas `AnimatedBeacon`, `AnimatedContainer`, `AnimatedOrphans` are PascalCase imports as those are components.

Alternatively, you may import from the top-level module `ember-animated` but only if your build environment supports
optimizations to shake out the unused components:

```gjs
import {
  AnimatedBeacon,
  AnimatedContainer,
  animatedEach,
  animatedIf,
  AnimatedOrphans,
  animatedValue,
} from 'ember-animated';
```

## Usage with Glint

`ember-animated` is a glint enabled addon. If you'd like to typecheck your .hbs files, add this to your `types/global.d.ts` file:

```ts
import '@glint/environment-ember-loose';

import type EmberAnimatedRegistry from 'ember-animated/template-registry';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberAnimatedRegistry, /* other addon registries */ {
    // local entries
  }
}
```

For the entire guide, please refer to [Using
Addons](https://typed-ember.gitbook.io/glint/environments/ember/using-addons#using-glint-enabled-addons)
section on the glint handbook.

Types are made available through package.json `exports` field. In order for TS
to recognize this (beginning from TS 4.7), you must set
[`moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution)
to `node16` or `nodenext`.

## Note on `ember-element-helper`

As this addon depends on [`ember-element-helper`](https://github.com/tildeio/ember-element-helper),
you need to ensure your lock file has `ember-element-helper` v0.8.0 or higher
as that's the version where Glint types were introduced in `ember-element-helper`
which are necessary for `ember-animated` Glint types to function properly.
