/* eslint-disable require-yield */
//BEGIN-SNIPPET sprites-snippet.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default class SpriteExample extends Component {
  @tracked items = this.makeItems();

  makeItems() {
    let result = [];
    for (let i = 0; i < 7; i++) {
      result.push(makeRandomItem(i));
    }
    return result;
  }

  *transition(context) {
    let { insertedSprites, keptSprites, removedSprites } = context;
    insertedSprites.forEach((sprite) => {
      sprite.applyStyles({ 'z-index': '1' });
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach((sprite) => {
      sprite.applyStyles({ 'z-index': '1' });
      sprite.endAtPixel({ x: window.innerWidth * 0.8 });
      move(sprite, { easing: easeIn });
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

  @action deleteItems() {
    let items = this.items;
    this.items = items.filter((item) => !item.deleteMessage);
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
  return {
    message: messages[index],
    deleteMessage: false,
    received: new Date(),
  };
}
//END-SNIPPET
