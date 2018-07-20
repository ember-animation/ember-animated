//BEGIN-SNIPPET between-swap-lists-snippet.js
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { computed } from '@ember/object';

export default Component.extend({
  transition: computed('animateSendingSide', function() {
    if (this.get('animateSendingSide')) {
      return this.moveSent.bind(this);
    } else {
      return this.moveReceived.bind(this);
    }
  }),

  moveReceived: function * (context) {
    let { receivedSprites, insertedSprites } = context;
    receivedSprites.forEach(sprite => {
      move(sprite);
    });

    insertedSprites.forEach(sprite => {
      sprite.reveal();
    });

    this.set('message', printSprites(context));

  },

  moveSent: function * (context) {
    let { sentSprites, insertedSprites } = context;
    sentSprites.forEach(sprite => {
      move(sprite);
    });

    insertedSprites.forEach(sprite => {
      sprite.reveal();
    });

    this.set('message', printSprites(context));
  },

  init() {
    this._super();
    this.set('leftItems', makeRandomList());
  },
  actions: {
    swap() {
      if (this.get('leftItems')) {
        this.set('leftItems', null);
        this.set('rightItems', makeRandomList());
      } else {
        this.set('leftItems', makeRandomList());
        this.set('rightItems', null);
      }
    }
  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { id: Math.round(Math.random()*1000), message: messages[index] };
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 7; i++) {
    result.push(makeRandomItem(i));
  }
  result.push({ id: 1, message: "Aloha" });
  result.push({ id: 400, message: "Welcome" });
  result.push({ id: 800, message: "Urgent" });

  return result.sort(numeric);
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