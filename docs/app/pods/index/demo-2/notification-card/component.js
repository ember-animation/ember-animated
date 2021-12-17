import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { computed, action } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  tagName: '',

  progress: 0,
  onDismiss() {},

  didInsertElement() {
    this._super(...arguments);
    this.get('startProgress').perform();
  },

  startProgress: task(function* () {
    let totalMilliseconds = 5000;
    let millisecondsPerPercent = totalMilliseconds / 100;

    while (this.get('progress') < 100) {
      yield timeout(millisecondsPerPercent / 2);
      this.set('progress', this.get('progress') + 0.5);
    }

    this.get('onDismiss')();
  }),

  progressWidthStyle: computed('progress', function () {
    return htmlSafe(`width: ${this.get('progress')}%`);
  }),

  cancelProgress: action(function () {
    this.get('startProgress').cancelAll();
  }),

  resumeProgress: action(function () {
    this.get('startProgress').perform();
  }),
});
