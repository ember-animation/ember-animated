//BEGIN-SNIPPET between-two-lists-example-snippet.js
import { later } from '@ember/runloop';
import Component from '@ember/component';
import move from 'ember-animated/motions/move';

export default Component.extend({
  bounceBack: false,
  init() {
    this._super();
    this.transition = this.transition.bind(this);
    this.leftItems = this.leftItems();
    this.rightItems = this.rightItems();
  },

  transition: function * (context) {
    let { keptSprites, sentSprites, receivedSprites } = context;

    keptSprites.forEach(sprite => {
      move(sprite);
    });

    sentSprites.forEach(sprite => {
      move(sprite);
    });

    receivedSprites.forEach(sprite => {
      sprite.moveToFinalPosition();
    });

    this.set('message', printSprites(context));
    
  },

  leftItems() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem(i));
    }
    return (result);
  },

  rightItems() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem(i));
    }
    return (result);
  },

  actions: {
    move(item, bounceCounter=1) {
      let rightItems = this.get('rightItems');
      let leftItems = this.get('leftItems');
      let index = rightItems.indexOf(item);
      if (index !== -1) {
        this.set('rightItems', rightItems.slice(0, index).concat(rightItems.slice(index+1)));
        this.set('leftItems', leftItems.concat([item]));
      } else {
        index = leftItems.indexOf(item);
        this.set('leftItems', leftItems.slice(0, index).concat(leftItems.slice(index+1)));
        this.set('rightItems', rightItems.concat([item]));
      }
      if (this.get('bounceBack') && bounceCounter > 0) {
        later(() => this.send('move', item, bounceCounter - 1), 1000);
      }
    }
  }
});


function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { id: Math.round(Math.random()*1000), message: messages[index] };
}
//END-SNIPPET

function printSprites (context) {
  let spriteSummary = ['inserted', 'kept', 'removed', 'sent', 'received'].map(type => {
    return type + '=' + context[`_${type}Sprites`].map(s => {
      return s.owner.value.message;
    });
  });
  return spriteSummary;
}