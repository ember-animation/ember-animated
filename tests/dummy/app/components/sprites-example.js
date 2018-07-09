//BEGIN-SNIPPET sprites-snippet.js
import { A } from '@ember/array';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { task, timeout } from 'ember-animated/-private/ember-scheduler';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend({
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
    let { insertedSprites, keptSprites, removedSprites } = context;
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: window.innerWidth });
      move(sprite, { easing: easeOut });
      let message = this.printSprites(context);
      this.set('message', message);
    });

    keptSprites.forEach(move);

    removedSprites.forEach(sprite => {
      sprite.endAtPixel({ x: window.innerWidth * 0.8 });
      move(sprite, { easing: easeIn });
      let message = this.printSprites(context);
      this.set('message', message);
    });
  },

  currentSort: numeric,
  items: computed({
    get() {
      let result = [];
      for (let i = 0; i < 5; i++) {
        result.push(makeRandomItem(i));
      }
      return A(result);
    },
    set(k,v) {
      return A(v);
    }
 }),

  chaos: task(function * (running) {
    if (!running) { return; }
    while (true) {
      yield timeout(1000);
      this.send('addItem');
      yield timeout(1000);
      this.send('removeItem', this.get('items')[Math.floor(Math.random()*this.get('items.length'))]);
    }
  }).restartable(),

  actions: {
    addItem() {
      let items = this.get('items');
      // This deliberately uses stable keys but unstable objects
      let index = Math.floor(Math.random() * Math.floor(10));
      let item = makeRandomItem(index);
      this.set('message', `add ${item.message} at ${item.id}`);
      this.set('items', items.slice(0, 0).concat([makeRandomItem(index)]).concat(items.slice(0)));
    },
    removeItem(which) {
      let items = this.get('items');
      this.set('message', `remove ${which.message} at ${which.id}`);
      this.set('items', items.filter(i => i !== which));
    },
    replaceItem(which) {
      let items = this.get('items');
      let index = items.indexOf(which);
      this.set('items', items.slice(0, index).concat([makeRandomItem()]).concat(items.slice(index+1)));
    },
  }
});

function numeric(a,b) { return a.message - b.message; }

function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { id: Math.round(Math.random()*1000), message: messages[index] };
}


//END-SNIPPET
