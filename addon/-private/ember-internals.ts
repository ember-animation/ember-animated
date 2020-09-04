/*
  This module is intended to encapsulate all the known places where
  ember-animated depends on non-public Ember APIs.

  See also tests/helpers/ember-testing-internals.js, which does the
  same thing but for code that is only needed in the test environment.

 */
import { get } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Ember from 'ember';
import { warn } from '@ember/debug';
import Component from '@ember/component';
const { getViewBounds } = (Ember.ViewUtils as unknown) as {
  getViewBounds(view: Component): { firstNode: Node; lastNode: Node };
};

export function componentNodes(view: Component) {
  let bounds = getViewBounds(view);
  return {
    firstNode: bounds.firstNode,
    lastNode: bounds.lastNode,
  };
}

export function forEachElement(view: Component, fn: (elt: Element) => void) {
  let { firstNode, lastNode } = componentNodes(view);
  let node: Node | null = firstNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      fn(node as Element);
    } else if (!/^\s*$/.test(node.textContent!)) {
      warn('Found bare text content inside an animator', false, {
        id: 'ember-animated-bare-text',
      });
    }
    if (node === lastNode) {
      break;
    }
    node = node.nextSibling;
  }
}

export function keyForArray(
  keyPath: string | undefined | null,
): (item: unknown, index: number) => string {
  switch (keyPath) {
    case '@index':
      return index;
    case '@identity':
    case undefined:
    case null:
      return identity;
    default:
      return (item: unknown) => get(item as any, keyPath);
  }
}

function index(_item: unknown, index: number) {
  return String(index);
}

function identity(item: unknown) {
  switch (typeof item) {
    case 'string':
    case 'number':
      return String(item);
    default:
      return guidFor(item);
  }
}
