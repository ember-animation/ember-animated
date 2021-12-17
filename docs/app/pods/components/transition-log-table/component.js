import Component from '@ember/component';
import { A } from '@ember/array';

function printSprites(context) {
  return {
    inserted: context._insertedSprites.map((s) => s.owner.value.message),
    kept: context._keptSprites.map((s) => s.owner.value.message),
    removed: context._removedSprites.map((s) => s.owner.value.message),
  };
}

export default Component.extend({
  tagName: '',
  init() {
    this._super();
    this.messages = A();
  },
  logTransition(context) {
    this.messages.pushObject(printSprites(context));
  },
});

export const extensions = {
  init() {
    this._super();
    this.transition = this.transition.bind(this);
  },
  transition: function (context) {
    this.logTransition(context);
    return this._super(context);
  },
};
