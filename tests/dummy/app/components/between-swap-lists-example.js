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

  printSprites (context, label) {
    let isOrphan;
    let prefix = label ? label + ' ' : '';
    let spriteSummary = ['inserted', 'kept', 'removed', 'sent', 'received'].map(type => {
      return type + '=' + context[`_${type}Sprites`].map(s => {
        if (isOrphan == null) {
          isOrphan = !s.element.parentElement ||
            s.element.parentElement.classList.contains('animated-orphans');
        }
        return s.owner.value.message;
      }).join(',');
    }).join(" | ");
    return (prefix + spriteSummary +  (isOrphan ? ' | (orphan)' : ''));
  },

  moveReceived: function * (context) {
    let { receivedSprites, insertedSprites } = context;
    receivedSprites.forEach(sprite => {
      move(sprite);
      let message = this.printSprites(context);
      this.set('message', message);
    });
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach(sprite => {
      sprite.reveal();
      let message = this.printSprites(context);
      this.set('message', message);
    });
  },

  moveSent: function * (context) {
    let { sentSprites, insertedSprites } = context;
    sentSprites.forEach(sprite => {
      move(sprite);
      let message = this.printSprites(context);
      this.set('message', message);
    });
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach(sprite => {
      sprite.reveal();
      let message = this.printSprites(context);
      this.set('message', message);
    });
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

// function makeRandomItem() {
//   return { id: Math.round(Math.random()*1000) };
// }

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