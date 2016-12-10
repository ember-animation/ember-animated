import Component from 'ember-component';
import { toUp } from 'ember-animated/transitions/move-over'
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  rules,
  counter: 0,
  clock: task(function *() {
    while (true) {
      yield timeout(1000);
      this.set('counter', this.get('counter') + 1);
    }
  }).on('didInsertElement'),
  actions: {
    bump() {
      this.set('counter', this.get('counter') + 1);
    }
  }
});

function rules(/* firstTime, oldItems, newItems */) {
  return toUp;
}
