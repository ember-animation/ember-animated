/* eslint-disable require-yield */
//BEGIN-SNIPPET between-components-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';
import { later } from '@ember/runloop';

export default class extends Component {
  @tracked items = this.makeItems();
  @tracked deleteUndo = false;

  makeItems() {
    let result = [];
    for (let i = 0; i < 7; i++) {
      result.push(makeRandomItem(i));
    }
    return result;
  }

  *transition({ insertedSprites, keptSprites, removedSprites, beacons }) {
    insertedSprites.forEach((sprite) => {
      sprite.startAtSprite(beacons.add);
      parallel(move(sprite, scale(sprite)));
    });

    keptSprites.forEach((sprite) => {
      move(sprite, scale(sprite));
    });

    removedSprites.forEach((sprite) => {
      sprite.endAtSprite(beacons.trash);
      parallel(move(sprite, scale(sprite)));
    });
  }

  @action addItem() {
    let items = this.items;
    let index = Math.floor(Math.random() * Math.floor(10));
    this.items = items
      .slice(0, 0)
      .concat([makeRandomItem(index)])
      .concat(items.slice(0));
  }

  @action removeItem(which) {
    let items = this.items;
    let index = items.indexOf(which);
    this.items = items.filter((i) => i !== which);
    if (this.deleteUndo) {
      later(() => this.restoreItem(which, index), 1000);
    }
  }

  @action restoreItem(which, index) {
    let items = this.items;
    this.items = items.concat(items.splice(index, 0, which));
  }

  @action toggleDeleteUndo() {
    this.deleteUndo = !this.deleteUndo;
  }
}

function makeRandomItem(index) {
  let messages = [
    'Hi',
    'Hello',
    'Invitation',
    'Thank You',
    'Congratulations',
    'Namaste',
    'Happy Birthday',
    'Aloha',
    'Welcome',
    'Urgent',
  ];
  return { id: Math.round(Math.random() * 1000), message: messages[index] };
}
//END-SNIPPET
