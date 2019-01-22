import Component from '@ember/component';
import move from 'ember-animated/motions/move';
import resize from 'ember-animated/motions/resize';
import opacity from 'ember-animated/motions/opacity';
import { wait } from 'ember-animated';

export default Component.extend({
  showLeft: true,

  outerBox: function * ({ receivedSprites }) {
    receivedSprites.forEach(sprite => {
      move(sprite);
      resize(sprite);
    });
  },

  logo: function * ({ sentSprites }) {
    sentSprites.forEach(sprite => {

      // TODO: this should be the default behavior (deeper children who become
      // orphans should get listed later in the DOM within the animated-orphans
      // component)
      sprite.applyStyles({ 'z-index': 1 });

      move(sprite);
    });
  },

  // TODO: "group" really doesn't belong on the animators! It belongs (probably
  // as a data-attr) on their direct child elements. That way you can do
  // matching per-sprite when you have multiple sprite in the animator.

  // TODO: I think we can relax the initialInsertion/finalRemoval behavior to
  // *always* make available inserted/removed sprites *if* there are received or
  // sent sprites present in the same animator.

  boxContents: function * ({ receivedSprites, sentSprites, duration }) {
    sentSprites.forEach(sprite => {
      // this is needed because we're dealing with orphans who will no longer
      // automatically ride along with their original parent.
      //
      // TODO: if a parent and child sprite both get orphaned, can we maintain
      // their relationship? That would be best.
      move(sprite);

      opacity(sprite, { to: 0, duration: duration * 0.2 });
      sprite.applyStyles({ 'z-index': 1 });
    });
    receivedSprites.forEach(sprite => {

      // receivedSprites are moved by default to start at their matched sprite.
      // But in our case, we just want to sit in our own position and only touch
      // opacity (no position changes). So here we are jumping to our real final
      // position immediately.
      //
      // These receivedSprites are homed inside the receivedSprite that is doing
      // the outerBox transition. I *think* that if we moved *both* of them to
      // initial position of their matched sprites, their relative positioning
      // may make sense?
      //
      // TODO: either design an API that makes moved-by-default explicit instead
      // of implicit, OR see if there is an automatic nested behavior that we're
      // failing to do.
      let diff = sprite.difference('finalBounds', sprite, 'initialBounds');
      sprite.translate(diff.dx, diff.dy);

      sprite.applyStyles({ opacity: 0 });
    });

    if (receivedSprites.length > 0) {
      yield wait(duration * 0.8);
      receivedSprites.forEach(sprite => {
        opacity(sprite, { from: 0, to: 1, duration: duration * 0.2 });
      });
    }
  },

  actions: {
    swap() {
      this.set('showLeft', !this.showLeft);
    }
  }
});
