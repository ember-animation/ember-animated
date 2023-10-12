import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';
import move from 'ember-animated/motions/move';

class Item {
  @tracked x;
  @tracked y;

  constructor({ id, x, y }) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  get style() {
    return htmlSafe(
      `top: ${parseFloat(this.y)}px; left: ${parseFloat(this.x)}px; `,
    );
  }
}

export default class extends Controller {
  *transition({ keptSprites }) {
    keptSprites.forEach(move);
  }

  constructor(...args) {
    super(...args);

    this.items = [];
    for (let i = 0; i < 4; i++) {
      this.items.push(new Item({ id: i, x: somewhere(), y: somewhere() }));
    }
  }

  @action go() {
    this.items.forEach((i) => {
      i.x = somewhere();
      i.y = somewhere();
    });
  }
}

function somewhere() {
  return Math.random() * 300;
}
