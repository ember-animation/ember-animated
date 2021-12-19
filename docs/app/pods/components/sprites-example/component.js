//BEGIN-SNIPPET sprites-snippet.js
import Component from '@ember/component';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  init() {
    this._super();
    this.items = this.makeItems();
  },

  makeItems() {
    let result = [];
    for (let i = 0; i < 7; i++) {
      result.push(makeRandomItem(i));
    }
    return result;
  },

  transition: function* (context) {
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
  },

  deleteAll: false,
  refresh: false,

  addItem: action(function () {
    let items = this.get('items');
    let index = Math.floor(Math.random() * Math.floor(10));
    this.set(
      'items',
      items
        .slice(0, 0)
        .concat([makeRandomItem(index)])
        .concat(items.slice(0)),
    );
  }),

  deleteItems: action(function () {
    let items = this.get('items');
    this.set(
      'items',
      items.filter((item) => !item.deleteMessage),
    );
  }),
});

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
