import { tracked as nativeTracked } from '@glimmer/tracking';
import { dependentKeyCompat as nativeDependentKeyCompat } from '@ember/object/compat';
import { gte } from 'ember-compatibility-helpers';
import { importSync } from '@embroider/macros';

let tracked;
let dependentKeyCompat;

/**
 * Allows using Octane syntax in tests and at the same time run tests
 * using pre-Octane version of Ember.js
 *
 * Dependency on `ember-tracked-polyfill` could be removed
 * once we drop support for Ember versions older than 3.13 in CI.
 *
 * As this is an addon, dependencySatisfies() from @embroider/macros
 * needs 'ember-source' to be listed in deps or peerDeps
 * which is not needed for the addon so use compatibility-helpers for the time being.
 */
if (gte('3.13.0')) {
  tracked = nativeTracked;
  dependentKeyCompat = nativeDependentKeyCompat;
} else {
  let polyfill = importSync('ember-tracked-polyfill');
  tracked = polyfill.tracked;
  dependentKeyCompat = polyfill.dependentKeyCompat;
}

export { tracked, dependentKeyCompat };
