import Ember from 'ember';

const { getViewBounds } = Ember.ViewUtils;

export function componentNodes(view) {
  let bounds = getViewBounds(view);
  return {
    firstNode: bounds.firstNode,
    lastNode: bounds.lastNode
  };
}
