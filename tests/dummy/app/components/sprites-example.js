//BEGIN-SNIPPET sprites-snippet.js
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
  init() {
    this._super();
    this.transition = this.transition.bind(this);
    this.items = this.items();
  },

  items() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem(i));
    }
    return (result);
  },

  transition: function * (context) {
    let { insertedSprites, keptSprites, removedSprites } = context;
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
    });

    keptSprites.forEach(move);

    removedSprites.forEach(sprite => {
      sprite.endAtPixel({ x: window.innerWidth * 0.8 });
      move(sprite, { easing: easeIn });
    });

    this.set('message', printSprites(context));
  },


  actions: {
    addItem() {
      let items = this.get('items');
      let index = Math.floor(Math.random() * Math.floor(10));
      this.set('items', items.slice(0, 0).concat([makeRandomItem(index)]).concat(items.slice(0)));
    },
    removeItem(which) {
      let items = this.get('items');
      this.set('items', items.filter(i => i !== which));
    }
  }
});

function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { message: messages[index] };
}
//END-SNIPPET

function printSprites (context, label) {
  let prefix = label ? label + ' ' : '';
  let spriteSummary = ['inserted', 'kept', 'removed'].map(type => {
    return type + '=' + context[`_${type}Sprites`].map(s => {
      return s.owner.value.message;
    }).join(',');
  }).join(" | ");
  return (prefix + spriteSummary);
}