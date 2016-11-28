/*
  This module is intended to encapsulate all the known places where
  liquid-fire depends on non-public Ember APIs.

  See also tests/helpers/ember-testing-internals.js, which does the
  same thing but for code that is only needed in the test environment.

 */

// These things are swapped out at build time based on the Ember
// version.
export {
  componentNodes
} from './ember-internals/version-specific';
