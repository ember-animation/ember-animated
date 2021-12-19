import Component from '@ember/component';
import { A } from '@ember/array';
import { action } from '@ember/object';

function printSprites(context) {
  return {
    kept: context._keptSprites.map((s) => s.owner.value.message),
    sent: context._sentSprites.map((s) => s.owner.value.message),
    received: context._receivedSprites.map((s) => s.owner.value.message),
  };
}

export default Component.extend({
  tagName: '',
  init() {
    this._super();
    this.messages = A();
  },
  fullLog: action(function (context) {
    this.messages.pushObject(printSprites(context));
  }),
});

export const extensions = {
  init() {
    this._super();
    this.transition = this.transition.bind(this);
  },
  transition: function (context) {
    this.fullLog(context);
    return this._super(context);
  },
};
