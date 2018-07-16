//BEGIN-SNIPPET between-two-lists-example-snippet.js
import { later } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import move from 'ember-animated/motions/move';

export default Component.extend({
  bounceBack: false,
  init() {
    this._super();
    this.transition = this.transition.bind(this);
  },

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

  transition: function * (context) {
    let { keptSprites, sentSprites, receivedSprites } = context;
    // The parts of each list that haven't changed moves to accomodate
    // inserted and removed peers
    keptSprites.forEach(sprite => {
      move(sprite);
      let message = this.printSprites(context);
      this.set('message', message);
    });

    // Elements that are leaving our list get animated into their new
    // positions in the other list.
    sentSprites.forEach(sprite => {
      move(sprite);
      let message = this.printSprites(context);
      this.set('message', message);
    });

    // Elements that are arriving in our list don't animate (the other
    // list's sentSprites will animate instead). But we want them to
    // start in their final position so that when they're revealed
    // they're already in the right place.
    //
    // Without this, they would get the default behavior for
    // receivedSprites, which is starting at the same location as the
    // corresponding element in the other list.
    receivedSprites.forEach(sprite => {
      sprite.moveToFinalPosition();
      let message = this.printSprites(context);
      this.set('message', message);
    });
    
  },

  leftItems: computed({
    get() {
      let result = [];
      for (let i = 0; i < 5; i++) {
        result.push(makeRandomItem(i));
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
      for (let i = 0; i < 5; i++) {
        result.push(makeRandomItem(i));
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

// function numeric(a,b) { return a.id - b.id; }

// function makeRandomItem() {
//   return { id: Math.round(Math.random()*1000) };
// }

function numeric(a,b) { return a.message - b.message; }

function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { id: Math.round(Math.random()*1000), message: messages[index] };
}
//END-SNIPPET