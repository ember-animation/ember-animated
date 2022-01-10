import { tracked as nativeTracked } from '@glimmer/tracking';
import { dependentKeyCompat as nativeDependentKeyCompat } from '@ember/object/compat';
import { dependencySatisfies, importSync } from '@embroider/macros';

let tracked;
let dependentKeyCompat;

/**
 * Allows using Octane syntax in tests and at the same time run tests
 * using pre-Octane version of Ember.js
 *
 * Dependency on `ember-tracked-polyfill` could be removed
 * once we drop support for Ember versions older than 3.13 in CI.
 */
if (
  dependencySatisfies('ember-source', '<= 3.12') &&
  dependencySatisfies('ember-tracked-polyfill', '*')
) {
  let polyfill = importSync('ember-tracked-polyfill');
  tracked = polyfill.tracked;
  dependentKeyCompat = polyfill.dependentKeyCompat;
} else {
  tracked = nativeTracked;
  dependentKeyCompat = nativeDependentKeyCompat;
}

export { tracked, dependentKeyCompat };
