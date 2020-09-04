import Component from '@ember/component';
import { forEachElement } from '../-private/ember-internals';
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
    forEachElement(this, elt => {
      mapping.set(elt, child);
    });
  }
}
