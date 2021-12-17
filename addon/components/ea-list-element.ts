import { warn } from '@ember/debug';
import Component from '@ember/component';
import { componentNodes } from '../-private/ember-internals';
import Child from '../-private/child';

/*
   This component has one job: tracking which DOM elements correspond
   with which list elements.
*/

export default class extends Component {
  tagName = '';
  isEmberAnimatedListElement = true;

  child!: Child;
  elementToChild!: Map<Element, Child>;

  didRender() {
    let mapping = this.get('elementToChild');
    let child = this.get('child');
    this._forEachElement((elt) => {
      mapping.set(elt, child);
    });
  }

  _forEachElement(fn: (elt: Element) => void) {
    let { firstNode, lastNode } = componentNodes(this);
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
