//BEGIN-SNIPPET moving-word-text-snippet.js
import Component from '@ember/component';
import { action } from '@ember/object';
import fade from 'ember-animated/transitions/fade';

export default Component.extend({
  listMode: false,
  fade,

  toggle: action(function () {
    this.set('listMode', !this.listMode);
  }),

  normal: action(function () {
    this.set('noAdjustments', !this.noAdjustments);
  }),
});
//END-SNIPPET
