import Component from '@glimmer/component';

export default class ScrollToTop extends Component {
  /*This is here because a demo on the between page preserves the scrolling when it is interacted with.
  This makes sure that when transitioning from or to this page, it always scrolls to the top. */
  constructor(...args) {
    super(...args);

    document.documentElement.scrollTop = 0;
  }
}
