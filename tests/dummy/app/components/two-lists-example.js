import { later } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import { printSprites } from 'ember-animated';
import rotate from '../motions/rotate';

export default Component.extend({
  bounceBack: false,

  transition: function * ({ keptSprites, sentSprites }) {
    // The parts of each list that haven't changed moves to accomodate
    // inserted and removed peers
    keptSprites.forEach(move);

    // Elements that are leaving our list get animated into their new
    // positions in the other list.
    sentSprites.forEach(move);
  },


  faceRight: function * (context) {
    yield * turn(1, context);
  },

  faceLeft: function * (context) {
    yield * turn(-1, context);
  },

  leftItems: computed({
    get() {
      let result = [];
      for (let i = 0; i < 10; i++) {
        result.push(makeRandomItem());
      }
      return result.sort(numeric);
    },
    set(k,v) {
      return v;
    }
  }),

  rightItems: computed({
    get() {
      let result = [];
      for (let i = 0; i < 10; i++) {
        result.push(makeRandomItem());
      }
      return result.sort(numeric);
    },
    set(k,v) {
      return v;
    }
  }),

  actions: {
    move(item, bounceCounter=1) {
      let rightItems = this.get('rightItems');
      let leftItems = this.get('leftItems');
      let index = rightItems.indexOf(item);
      if (index !== -1) {
        this.set('rightItems', rightItems.slice(0, index).concat(rightItems.slice(index+1)));
        this.set('leftItems', leftItems.concat([item]).sort(numeric));
      } else {
        index = leftItems.indexOf(item);
        this.set('leftItems', leftItems.slice(0, index).concat(leftItems.slice(index+1)));
        this.set('rightItems', rightItems.concat([item]).sort(numeric));
      }
      if (this.get('bounceBack') && bounceCounter > 0) {
        later(() => this.send('move', item, bounceCounter - 1), 1000);
      }
    }
  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}

function * turn (direction, { sentSprites }) {
  printSprites(arguments[1]);
  sentSprites.forEach(sprite => {
    sprite.applyStyles({
      zIndex: 1
    });
    move(sprite);
    rotate(sprite, { direction });
  });
}
