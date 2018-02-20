// Given an Ember Component, return its first and last Nodes.
export function componentNodes(component) {
  return {
    firstNode: component._renderNode.firstNode,
    lastNode: component._renderNode.lastNode
  };
}
