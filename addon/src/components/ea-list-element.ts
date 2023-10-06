import { warn } from '@ember/debug';
import Component from '@ember/component';
import { componentNodes } from '../-private/ember-internals.ts';
import type Child from '../-private/child.ts';

interface EaListElementSignature<T = unknown> {
  Args: {
    Named: {
      child: T;
      elementToChild: WeakMap<Element, Child>;
    };
  };
  Blocks: {
    default: [T, number];
  };
}

/*
   This component has one job: tracking which DOM elements correspond
   with which list elements.
*/

export default class EaListElement extends Component<EaListElementSignature> {
  tagName = '';
  isEmberAnimatedListElement = true;

  child!: Child;
  elementToChild!: Map<Element, Child>;

  didRender() {
    super.didRender();
    let mapping = this.elementToChild;
    let child = this.child;
    this._forEachElement((elt) => {
      mapping.set(elt, child);
    });
  }

  _forEachElement(fn: (elt: Element) => void) {
    let { firstNode, lastNode } = componentNodes(this as unknown as Component);
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
}
