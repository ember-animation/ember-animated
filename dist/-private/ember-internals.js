import { get } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { getViewBounds as getViewBounds$1 } from '@ember/-internals/views';

/*
  This module is intended to encapsulate all the known places where
  ember-animated depends on non-public Ember APIs.

  See also tests/helpers/ember-testing-internals.js, which does the
  same thing but for code that is only needed in the test environment.

 */
const getViewBounds = getViewBounds$1;
function componentNodes(view) {
  let bounds = getViewBounds(view);
  return {
    firstNode: bounds.firstNode,
    lastNode: bounds.lastNode
  };
}
function keyForArray(keyPath) {
  switch (keyPath) {
    case '@index':
      return index;
    case '@identity':
    case undefined:
    case null:
      return identity;
    default:
      return item => get(item, keyPath);
  }
}
function index(_item, index) {
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

export { componentNodes, keyForArray };
//# sourceMappingURL=ember-internals.js.map
