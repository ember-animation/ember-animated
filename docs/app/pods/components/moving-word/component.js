/* eslint-disable require-yield */
//BEGIN-SNIPPET moving-word-snippet.js
import Component from '@glimmer/component';
import move from 'ember-animated/motions/move';
import adjustCSS from 'ember-animated/motions/adjust-css';
import adjustColor from 'ember-animated/motions/adjust-color';
import compensateForScale from 'ember-animated/motions/compensate-for-scale';
import { parallel } from 'ember-animated';

export default class MovingWord extends Component {
  constructor(...args) {
    super(...args);

    this.transition = this.transition.bind(this);
  }

  motions() {
    let motions = [];
    if (!this.args.disableMove) {
      motions.push(move);
    }
    if (!this.args.disableCompensateForScale) {
      motions.push(compensateForScale);
    }
    if (!this.args.disableAdjustFontSize) {
      motions.push(adjustCSS.property('font-size'));
    }
    if (!this.args.disableAdjustLetterSpacing) {
      motions.push(adjustCSS.property('letter-spacing'));
    }
    if (!this.args.disableAdjustColor) {
      motions.push(adjustColor.property('color'));
    }
    return motions;
  }

  *transition({ sentSprites }) {
    let motions = this.motions();
    sentSprites.forEach(parallel(...motions));
  }
}
//END-SNIPPET
