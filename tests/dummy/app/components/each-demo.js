/* if changes are made here please also reflect them in
the comments in the docs */
import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { fadeOut } from 'ember-animated/motions/opacity';

export default class EachDemo extends Component {
  @tracked items = ['A', 'B', 'C', 'D', 'E'];

  *transition({ keptSprites, removedSprites }) {
    keptSprites.forEach(move);
    removedSprites.forEach(fadeOut);
  }

  @action removeItem(item) {
    this.items = this.items.filter((i) => i !== item);
  }
}
