import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  /*This is here because a demo on the between page preserves the scrolling when it is interacted with.
  This makes sure that when transitioning from or to this page, it always scrolls to the top. */
  didInsertElement() {
    document.documentElement.scrollTop = 0;
  },
});
