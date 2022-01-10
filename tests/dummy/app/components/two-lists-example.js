import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import move from 'ember-animated/motions/move';

export default class TwoListsExample extends Component {
  @tracked bounceBack = false;

  @tracked leftItems = makeRandomItems();
  @tracked rightItems = makeRandomItems();

  *transition({ keptSprites, sentSprites, receivedSprites }) {
    // The parts of each list that haven't changed moves to accomodate
    // inserted and removed peers
    keptSprites.forEach(move);

    // Elements that are leaving our list get animated into their new
    // positions in the other list.
    sentSprites.forEach(move);

    // Elements that are arriving in our list don't animate (the other
    // list's sentSprites will animate instead). But we want them to
    // start in their final position so that when they're revealed
    // they're already in the right place.
    //
    // Without this, they would get the default behavior for
    // receivedSprites, which is starting at the same location as the
    // corresponding element in the other list.
    receivedSprites.forEach((sprite) => sprite.moveToFinalPosition());
  }

  @action move(item, bounceBack) {
    let rightItems = this.rightItems;
    let leftItems = this.leftItems;
    let index = rightItems.indexOf(item);

    if (index !== -1) {
      this.rightItems = rightItems
        .slice(0, index)
        .concat(rightItems.slice(index + 1));
      this.leftItems = leftItems.concat([item]).sort(numeric);
    } else {
      index = leftItems.indexOf(item);
      this.leftItems = leftItems
        .slice(0, index)
        .concat(leftItems.slice(index + 1));
      this.rightItems = rightItems.concat([item]).sort(numeric);
    }

    if (bounceBack) {
      later(() => this.move(item, false), 1000);
    }
  }

  @action toggleBounceBack() {
    this.bounceBack = !this.bounceBack;
  }
}

function numeric(a, b) {
  return a.id - b.id;
}

function makeRandomItem() {
  return { id: Math.round(Math.random() * 1000) };
}

function makeRandomItems() {
  let result = [];
  for (let i = 0; i < 10; i++) {
    result.push(makeRandomItem());
  }
  return result.sort(numeric);
}
