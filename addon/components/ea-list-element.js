import Ember from 'ember';
import { componentNodes } from 'ember-animated/ember-internals';

export default Ember.Component.extend({
  tagName: '',

  didInsertElement() {
    let mapping = this.get('elementToItem');
    let item = this.get('item');
    this._forEachElement(elt => {
      mapping.set(elt, item);
    });
  },

  _forEachElement(fn) {
    let { firstNode, lastNode } = componentNodes(this);
    let node = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        fn(node);
      } else if (! /^\s*$/.test(node.textContent)) {
        Ember.warn("Found bare text content inside an animator", false, { id: "ember-animated-bare-text" });
      }
      if (node === lastNode){ break; }
      node = node.nextSibling;
    }
  }

});
