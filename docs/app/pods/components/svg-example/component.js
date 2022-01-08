/* eslint-disable require-yield */
//BEGIN-SNIPPET svg-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moveSVG from 'ember-animated/motions/move-svg';
import { parallel } from 'ember-animated';

function generateBubbles() {
  let list = [];
  for (let id = 0; id < 10; id++) {
    list.push({
      id,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      radius: Math.floor(Math.random() * 50),
    });
  }
  return list;
}

export default class SvgExample extends Component {
  @tracked bubbles = generateBubbles();

  *moveThem({ keptSprites }) {
    keptSprites.forEach(
      parallel(
        moveSVG.property('cx'),
        moveSVG.property('cy'),
        moveSVG.property('r'),
      ),
    );
  }

  @action move() {
    this.bubbles = generateBubbles();
  }
}
//END-SNIPPET
