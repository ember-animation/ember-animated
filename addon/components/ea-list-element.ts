import { warn } from '@ember/debug';
import Component from '@ember/component';
import { componentNodes } from '../-private/ember-internals';
import { gte } from 'ember-compatibility-helpers';

/*
   This component has one job: tracking which DOM elements correspond
   with which list elements.
*/

export default class extends Component {
  tagName = '';
  isEmberAnimatedListElement = true;

  child!: Child;
  elementToChild!: Map<Element, Child>;

  constructor(properties: any | undefined) {
    super(
      gte('3.8.0')
        ? properties
        : // in older Ember, for the Component base class to see these class
          // properties they must get passed into super:
          Object.assign(properties, { tagName: '' }),
    );
    if (!gte('3.8.0')) {
      // in older Ember, any declared but not initialized class properties that
      // come in as arguments need to get re-set here because typescript
      // initializes them to undefined *after* Ember has already set them in
      // super.
      this.elementToChild = properties.elementToChild;
      this.child = properties.child;
    }
  }

  didRender() {
    let mapping = this.get('elementToChild');
    let child = this.get('child');
    this._forEachElement(elt => {
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

// TODO: replace with real one from animated-each
interface Child {
  id: string;
}
