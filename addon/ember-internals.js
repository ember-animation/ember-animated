/*
  This module is intended to encapsulate all the known places where
  liquid-fire depends on non-public Ember APIs.

  See also tests/helpers/ember-testing-internals.js, which does the
  same thing but for code that is only needed in the test environment.

 */
import Ember from 'ember';
const { get, guidFor } = Ember;


// These things are swapped out at build time based on the Ember
// version.
export {
  componentNodes
} from './ember-internals/version-specific';

export function keyForArray(keyPath) {
  switch (keyPath) {
    case '@index':
      return index;
    case '@identity':
    case undefined:
    case null:
      return identity;
    default:
      return (item) => get(item, keyPath);
  }
}

function index(item, index) {
  return String(index);
}

function identity(item) {
  switch (typeof item) {
    case 'string':
    case 'number':
      return String(item);
    default:
      return guidFor(item);
  }
}
