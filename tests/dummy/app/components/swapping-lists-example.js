import Component from '@glimmer/component';
import { tracked, dependentKeyCompat } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';

export default class SwappingListsExample extends Component {
  @dependentKeyCompat
  get transition() {
    if (this.animateSendingSide) {
      return this.moveSent;
    } else {
      return this.moveReceived;
    }
  }

  *moveReceived({ receivedSprites, insertedSprites }) {
    receivedSprites.forEach(move);
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach((s) => s.reveal());
  }

  *moveSent({ sentSprites, insertedSprites }) {
    sentSprites.forEach(move);
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach((s) => s.reveal());
  }

  @tracked distinguishSides = false;
  @tracked animateSendingSide = false;
  @tracked leftItems = makeRandomList();
  @tracked rightItems;

  @action swap() {
    if (this.leftItems) {
      this.leftItems = null;
      this.rightItems = makeRandomList();
    } else {
      this.leftItems = makeRandomList();
      this.rightItems = null;
    }
  }

  @action toggleDistinguishSides() {
    this.distinguishSides = !this.distinguishSides;
  }

  @action toggleAnimateSendingSide() {
    this.animateSendingSide = !this.animateSendingSide;
  }
}

function numeric(a, b) {
  return a.id - b.id;
}

function makeRandomItem() {
  return { id: Math.round(Math.random() * 1000) };
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 7; i++) {
    result.push(makeRandomItem());
  }
  result.push({ id: 1 });
  result.push({ id: 400 });
  result.push({ id: 800 });

  return result.sort(numeric);
}
