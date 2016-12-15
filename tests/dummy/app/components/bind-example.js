import Component from 'ember-component';
import { toUp, toDown, toLeft, toRight } from 'ember-animated/transitions/move-over'

export default Component.extend({
  rules,
  rules2,
  counter: 20,
  showBoth: true,
  actions: {
    increment() {
      this.set('counter', this.get('counter') + 1);
    },
    decrement() {
      this.set('counter', this.get('counter') - 1);
    }

  }
});

function rules(firstTime, oldItems, newItems) {
  if (firstTime) { return; }
  if (oldItems[0] < newItems[0]) {
    return toDown;
  } else {
    return toUp;
  }
}

function rules2(firstTime, oldItems, newItems) {
  if (firstTime) { return; }
  if (oldItems[0] < newItems[0]) {
    return toLeft;
  } else {
    return toRight;
  }
}
