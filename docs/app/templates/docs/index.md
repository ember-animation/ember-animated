# Overview

## Installation

To install Ember Animated, run

```sh
ember install ember-animated
```


## Usage with Glint

`ember-animated` is a glint enabled addon. Add this to your `types/global.d.ts` file:

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

### Note on `ember-element-helper`

As this addon depends on [`ember-element-helper`](https://github.com/tildeio/ember-element-helper),
you need to ensure your lock file has `ember-element-helper` v0.8.0 or higher
as that's the version where Glint types were introduced in `ember-element-helper`
which are necessary for `ember-animated` Glint types to function properly.
