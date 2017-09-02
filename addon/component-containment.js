import { componentNodes } from 'ember-animated/ember-internals';

export function nodeIsInsideComponent(node, component) {
  let ancestors = getAncestors(node);
  let { firstNode, lastNode } = componentNodes(component);
  let pointer = firstNode;

  while (pointer) {
    if (pointer.nodeType === Node.ELEMENT_NODE) {
      if (ancestors.indexOf(pointer) !== -1) {
        return true;
      }
    } else {
      if (pointer === node) {
        return true;
      }
    }
    if (pointer === lastNode){ break; }
    pointer = pointer.nextSibling;
  }
  return false;
}

function getAncestors(node) {
  let ancestors = [];
  let pointer = node.parentElement;
  while (pointer) {
    ancestors.push(pointer);
    pointer = pointer.parentElement;
  }
  return ancestors;
}
