import Component from '@ember/component';
import layout from '../templates/components/time-control';
import { TimeControl } from 'ember-animated/test-helpers';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  layout,
  classNames: ['ea-time-control'],
  speed: 1,

  tickMarks: computed(function() {
    return [
      { value: 0, text: 'Paused' },
      { value: 0.1, text: '10%' },
      { value: 0.25, text: '25%' },
      { value: 0.5, text: '50%' },
      { value: 1, text: '100%' },
    ].map(entry => {
      entry.position = htmlSafe(`left: ${100 * entry.value}%`);
      return entry;
    });
  }),
  didInsertElement() {
    this.time = new TimeControl();
    this.time.runAtSpeed(this.get('speed'));
  },
  willDestroyElement() {
    this.time.finished();
  },
  updateSpeed(event) {
    this._setSpeed(event.target.valueAsNumber);
  },
  tickMarkChosen(tickMark) {
    this._setSpeed(tickMark.value);
  },
  _setSpeed(speed) {
    this.set('speed', speed);
    if (speed === 0) {
      this.time.pause();
      this.set('scrubber', 0);
    } else {
      this.time.runAtSpeed(speed);
    }
  }
});
