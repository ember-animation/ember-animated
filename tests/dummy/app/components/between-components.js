//BEGIN-SNIPPET between-components-snippet.js
import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';
import { later } from '@ember/runloop';


export default Component.extend({
  init() {
    this._super();
    this.transition = this.transition.bind(this);
    this.items = this.items();
  },

  deleteUndo: false,

  items() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem(i));
    }
    return (result);
  },

  transition: function * (context) {
    let { insertedSprites, keptSprites, removedSprites, beacons } = context;
    insertedSprites.forEach(sprite => {
      sprite.startAtSprite(beacons.add);
      parallel(move(sprite, scale(sprite)));
    });

    keptSprites.forEach(sprite => {
      move(sprite, scale(sprite));
    });

    removedSprites.forEach(sprite => {
      sprite.endAtSprite(beacons.trash);
      parallel(move(sprite, scale(sprite)));
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
      let index = items.indexOf(which);
      this.set('items', items.filter(i => i !== which));
      if (this.get('deleteUndo')) {
        later(() => this.send('restoreItem', which, index), 1000);
      }
    },
    restoreItem(which, index) {
      let items = this.get('items');
      this.set('items', items.concat(items.splice(index, 0, which)));
      this.set('message', `replace ${which.message} at ${index}`);
    }
  }
});


function makeRandomItem(index) {
  var messages = ["hi", "hello", "Invitation", "Thank You", "Congratulations", "Namaste", "Happy Birthday", "Aloha", "Welcome","Urgent"];
  return { id: Math.round(Math.random()*1000), message: messages[index] };
}
//END-SNIPPET

function printSprites (context) {
  return { 
    inserted: context._insertedSprites.map(s =>  s.owner.value.message),
    kept: context._keptSprites.map(s => s.owner.value.message),
    removed: context._removedSprites.map(s =>s.owner.value.message)
  };
}