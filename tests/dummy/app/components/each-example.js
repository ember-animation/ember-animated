import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-animated/-private/ember-scheduler';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default class EachExample extends Component {
  @tracked currentSort = numeric;
  @tracked items = makeRandomList();
  @tracked message = '';

  *transition({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      // the 0.8 here is purely so I can easily see that the elements
      // are being properly removed immediately after they get far
      // enough
      sprite.endAtPixel({ x: window.innerWidth * 0.8 });
      move(sprite, { easing: easeIn });
    });
  }

  @task(function* (running) {
    if (!running) {
      return;
    }

    while (true) {
      yield timeout(1000);
      this.addItem();
      yield timeout(1000);
      this.removeItem(
        this.items[Math.floor(Math.random() * this.items.length)],
      );
    }
  }).restartable() // eslint-disable-line prettier/prettier
  chaos;

  @action addItem() {
    // This deliberately uses stable keys but unstable objects
    let item = new Item();
    this.message = `add ${item.id}`;
    this.items = this.items
      .concat([item])
      .sort(this.currentSort)
      .map((elt) => ({ id: elt.id }));
  }

  @action removeItem(which) {
    this.message = `remove ${which.id}`;
    this.items = this.items.filter((i) => i !== which);
  }

  @action replaceItem(which) {
    let items = this.items;
    let index = items.indexOf(which);
    this.items = items
      .slice(0, index)
      .concat([new Item()])
      .concat(items.slice(index + 1));
  }

  @action mutate(item) {
    item.id = makeRandomId();
  }

  @action sortNumeric() {
    this.currentSort = numeric;
    this.items = this.items.slice().sort(this.currentSort);
  }

  @action shuffle() {
    this.currentSort = random;
    this.items = this.items.slice().sort(this.currentSort);
  }

  @action startChaos() {
    this.chaos.perform(true);
  }

  @action stopChaos() {
    this.chaos.perform(false);
  }
}

function numeric(a, b) {
  return a.id - b.id;
}

class Item {
  @tracked id;

  constructor() {
    this.id = makeRandomId();
  }
}

function makeRandomId() {
  return Math.round(Math.random() * 1000);
}

function random() {
  return Math.random() - 0.5;
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 10; i++) {
    result.push(new Item());
  }
  return result.sort(numeric);
}
