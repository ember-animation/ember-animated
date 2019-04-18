import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { computed } from '@ember/object';

export default Component.extend({
  transition: computed('animateSendingSide', function() {
    if (this.get('animateSendingSide')) {
      return this.moveSent;
    } else {
      return this.moveReceived;
    }
  }),

  moveReceived: function * ({ receivedSprites, insertedSprites }) {
    receivedSprites.forEach(move);
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach(s => s.reveal());
  },

  moveSent: function * ({ sentSprites, insertedSprites }) {
    sentSprites.forEach(move);
    // without this, they won't reveal until the end of the whole
    // transition
    insertedSprites.forEach(s => s.reveal());
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

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 7; i++) {
    result.push(makeRandomItem());
  }
  result.push({ id: 1 });
  result.push({ id: 400 });
  result.push({ id: 800 });

  return result.sort(numeric);
}
