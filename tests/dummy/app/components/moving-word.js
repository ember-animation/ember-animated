//BEGIN-SNIPPET moving-word-snippet.js
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import adjustCSS from 'ember-animated/motions/adjust-css';
import adjustColor from 'ember-animated/motions/adjust-color';
import compensateForScale from 'ember-animated/motions/compensate-for-scale';
import { parallel } from 'ember-animated';

export default Component.extend({
  tagName: '',
  duration: 1000,
  transition: function * ({ sentSprites }) {
    sentSprites.forEach(
      parallel(
        move,
        compensateForScale,
        adjustCSS.property('font-size'),
        adjustCSS.property('letter-spacing'),
        adjustColor.property('color')
      )
    );
  }
}).reopenClass({
  positionalParams: ['text']
});
//END-SNIPPET