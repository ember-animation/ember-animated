//BEGIN-SNIPPET between-components-snippet.js
import Component from '@ember/component';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';
import { later } from '@ember/runloop';

export default Component.extend({
  init() {
    this._super();
    this.items = this.makeItems();
  },

  deleteUndo: false,

  makeItems() {
    let result = [];
    for (let i = 0; i < 7; i++) {
      result.push(makeRandomItem(i));
    }
    return result;
  },

  transition: function* ({
    insertedSprites,
    keptSprites,
    removedSprites,
    beacons,
  }) {
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
  },

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

  removeItem: action(function (which) {
    let items = this.get('items');
    let index = items.indexOf(which);
    this.set(
      'items',
      items.filter((i) => i !== which),
    );
    if (this.get('deleteUndo')) {
      later(() => this.send('restoreItem', which, index), 1000);
    }
  }),

  restoreItem: action(function (which, index) {
    let items = this.get('items');
    this.set('items', items.concat(items.splice(index, 0, which)));
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
  return { id: Math.round(Math.random() * 1000), message: messages[index] };
}
//END-SNIPPET
