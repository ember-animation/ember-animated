import { warn } from '@ember/debug';
import Component from '@ember/component';
import { componentNodes } from '../-private/ember-internals.js';

/*
   This component has one job: tracking which DOM elements correspond
   with which list elements.
*/

class EaListElement extends Component {
  tagName = '';
  isEmberAnimatedListElement = true;
  child;
  elementToChild;
  didRender() {
    super.didRender();
    let mapping = this.elementToChild;
    let child = this.child;
    this._forEachElement(elt => {
      mapping.set(elt, child);
    });
  }
  _forEachElement(fn) {
    let {
      firstNode,
      lastNode
    } = componentNodes(this);
    let node = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        fn(node);
      } else if (!/^\s*$/.test(node.textContent)) {
        warn('Found bare text content inside an animator', false, {
          id: 'ember-animated-bare-text'
        });
      }
      if (node === lastNode) {
        break;
      }
      node = node.nextSibling;
    }
  }
}

export { EaListElement as default };
//# sourceMappingURL=ea-list-element.js.map
