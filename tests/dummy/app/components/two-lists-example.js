import Ember from 'ember';
import Move from 'ember-animated/motions/move';

export default Ember.Component.extend({
  bounceBack: false,
  transition,

  leftItems: Ember.computed({
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

  rightItems: Ember.computed({
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
    moveLeft(item, bounceCounter=1) {
      let rightItems = this.get('rightItems');
      let leftItems = this.get('leftItems');
      let index = rightItems.indexOf(item);
      this.set('rightItems', rightItems.slice(0, index).concat(rightItems.slice(index+1)));
      this.set('leftItems', leftItems.concat([item]).sort(numeric));
      if (this.get('bounceBack') && bounceCounter > 0) {
        Ember.run.later(() => this.send('moveRight', item, bounceCounter - 1), 1000);
      }
    },
    moveRight(item, bounceCounter=1) {
      let rightItems = this.get('rightItems');
      let leftItems = this.get('leftItems');
      let index = leftItems.indexOf(item);
      this.set('leftItems', leftItems.slice(0, index).concat(leftItems.slice(index+1)));
      this.set('rightItems', rightItems.concat([item]).sort(numeric));
      if (this.get('bounceBack') && bounceCounter > 0) {
        Ember.run.later(() => this.send('moveLeft', item, bounceCounter - 1), 1000);
      }
    }
  }
});

function numeric(a,b) { return a.id - b.id; }

function makeRandomItem() {
  return { id: Math.round(Math.random()*1000) };
}

function * transition() {
  // The parts of each list that haven't changed moves to accomodate
  // inserted and removed peers
  this.keptSprites.forEach(sprite => this.animate(new Move(sprite)));

  // Elements that are leaving our list get animated into their new
  // positions in the other list.
  this.sentSprites.forEach(sprite => this.animate(new Move(sprite)));

  // Elements that are arriving in our list don't animate (the other
  // list's sentSprites will animate instead). But we want them to
  // start in their final position so that when they're revealed
  // they're already in the right place.
  //
  // Without this, they would get the default behavior for
  // receivedSprites, which is starting at the same location as the
  // corresponding element in the other list.
  this.receivedSprites.forEach(sprite => sprite.moveToFinalPosition());
}
