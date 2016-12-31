/*
   A Sprite is our handle to a DOM element that we want to animate.

   It manages locking and unlocking the element (which means taking it
   in and out of static document flow so it's readily animatable).

   It tracks the sprite's current transform.

   It tracks the sprite's initial and/or final bounds, as measured
   from the actual pre- and/or post-animation DOM.
*/

import $ from 'jquery';
import Ember from 'ember';
import Transform, {
  ownTransform,
  cumulativeTransform,
} from './transform';
import { continueMotions } from './motion';
import { collapsedChildren } from './margin-collapse';


const inFlight = new WeakMap();

class BaseSprite {
  constructor(element, predecessor) {
    if (predecessor) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
      this._revealed = predecessor._revealed;
    } else {
      let $elt = $(element);
      this._styleCache = $elt.attr('style') || null;
      this._parentElement = element.parentElement;
      this._revealed = !$elt.hasClass('ember-animated-hidden');
    }
    this.element = element;
    this.owner = null;
    this.initialBounds = null;
    this.finalBounds = null;
  }

  measureInitialBounds() {
    this.initialBounds = this.element.getBoundingClientRect();
  }
  measureFinalBounds() {
    this.finalBounds = this.element.getBoundingClientRect();
  }
  lock() {
    $(this.element).css(this._imposedStyle);
    inFlight.set(this.element, this);
  }
  applyStyles(styles) {
    Object.assign(this._imposedStyle, styles);
    $(this.element).css(styles);
  }
  unlock() {
    Ember.warn("Probable bug in ember-animated: an interrupted sprite tried to unlock itself", this.stillInFlight(), { id: "ember-animated-sprite-unlock" });
    inFlight.delete(this.element);
    if (this._styleCache) {
      $(this.element).attr('style', this._styleCache);
    } else {
      this.element.attributes.removeNamedItem('style');
    }
  }
  stillInFlight() {
    return inFlight.get(this.element) === this;
  }
  hide() {
    this._revealed = false;
    $(this.element).addClass('ember-animated-hidden');
  }
  display(flag) {
    if (flag) {
      $(this.element).removeClass('ember-animated-none');
    } else {
      $(this.element).addClass('ember-animated-none');
    }
  }
  reveal() {
    if (!this._revealed) {
      this._revealed = true;
      $(this.element).removeClass('ember-animated-hidden');
    }
  }
}

export class ContainerSprite extends BaseSprite {
  constructor(element) {
    let predecessor = inFlight.get(element);
    super(element, predecessor);
    this._imposedStyle = {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      'box-sizing': 'border-box'
    };
  }
}

export default class Sprite extends BaseSprite {
  constructor(element) {
    let predecessor = inFlight.get(element);
    super(element, predecessor);
    if (predecessor) {
      this.transform = predecessor.transform;
      this._imposedStyle = predecessor._imposedStyle;
      this._effectiveOffsetParent = predecessor._effectiveOffsetParent;
    } else {
      let computedStyle = getComputedStyle(this.element);
      this.transform = ownTransform(this.element);
      let { top, left, effectiveOffsetParent } = findOffsets(this.element, computedStyle, this.transform);
      this._imposedStyle = {
        top,
        left,
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
        position: computedStyle.position === 'fixed' ? 'fixed' : 'absolute',
        'box-sizing': 'border-box',
        margin: 0
      };
      this._effectiveOffsetParent = effectiveOffsetParent;
    }
    this.parentInitialBounds = null;
    this.parentFinalBounds = null;
  }
  translate(dx, dy) {
    let t = this.transform.mult(new Transform(1, 0, 0, 1, dx, dy));
    this.transform = t;
    this.applyStyles({
      transform: t.serialize()
    });
  }
  lock() {
    super.lock();
    this._handleMarginCollapse();
  }
  unlock() {
    super.unlock();
    this._clearMarginCollapse();
  }
  _handleMarginCollapse() {
    let element = this.element;
    let cs = getComputedStyle(element);

    for (let [ descendant ] of collapsedChildren(element, cs, 'Top')) {
      $(descendant).addClass('ember-animated-top-collapse');
    }
  }
  _clearMarginCollapse() {
    let element = this.element;
    let cs = getComputedStyle(element);
    for (let [ descendant ] of collapsedChildren(element, cs, 'Top')) {
      $(descendant).removeClass('ember-animated-top-collapse');
    }
  }
  measureInitialBounds() {
    super.measureInitialBounds();
    if (this._effectiveOffsetParent) {
      this.parentInitialBounds = this._effectiveOffsetParent.getBoundingClientRect();
    }
  }
  measureFinalBounds() {
    super.measureFinalBounds();
    if (this._effectiveOffsetParent) {
      this.parentFinalBounds = this._effectiveOffsetParent.getBoundingClientRect();
    }
  }
  startAt(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    this.translate(otherSprite.initialBounds.left - this.finalBounds.left, otherSprite.initialBounds.top - this.finalBounds.top);
    this.initialBounds = otherSprite.initialBounds;
  }
  startTranslatedBy(dx, dy) {
    this.initialBounds = {
      left: this.finalBounds.left + dx,
      top: this.finalBounds.top + dy
    };
    this.translate(this.initialBounds.left - this.finalBounds.left, this.initialBounds.top - this.finalBounds.top);
  }
  endTranslatedBy(dx, dy) {
    this.finalBounds = {
      left: this.initialBounds.left + dx,
      top: this.initialBounds.top + dy
    };
  }
  endRelativeTo(otherSprite) {
    this.endTranslatedBy(otherSprite.finalBounds.left - otherSprite.initialBounds.left, otherSprite.finalBounds.top - otherSprite.initialBounds.top);
  }
}

function findOffsets(element, computedStyle, transform) {
  let ownBounds = element.getBoundingClientRect();
  let left = ownBounds.left;
  let top = ownBounds.top;
  let effectiveOffsetParent = getEffectiveOffsetParent(element, computedStyle);
  if (effectiveOffsetParent) {
    if (effectiveOffsetParent.tagName === 'BODY') {
      // reading scroll off body doesn't reliably work cross browser
      left += window.scrollX;
      top += window.scrollY;
    } else {
      left += effectiveOffsetParent.scrollLeft;
      top += effectiveOffsetParent.scrollTop;
    }

    let eopComputedStyle = getComputedStyle(effectiveOffsetParent);
    if (eopComputedStyle.position !== 'static' || eopComputedStyle.transform !== 'none') {
      let eopBounds = effectiveOffsetParent.getBoundingClientRect();
      left -= eopBounds.left + parseFloat(eopComputedStyle.borderLeftWidth);
      top -= eopBounds.top + parseFloat(eopComputedStyle.borderTopWidth);

      let eopTransform = cumulativeTransform(effectiveOffsetParent);
      left /= eopTransform.a;
      top /= eopTransform.d;
    }
  }

  left -= transform.tx;
  top -= transform.ty;

  return { top, left, effectiveOffsetParent };
}

// This compensates for the fact that browsers are inconsistent in the
// way they report offsetLeft & offsetTop for elements with a
// transformed ancestor beneath their nearest positioned ancestor.
function getEffectiveOffsetParent(element, computedStyle) {
  if (computedStyle.position === 'fixed') { return null; }
  let offsetParent = element.offsetParent;
  let cursor = element.parentElement;
  while (cursor && offsetParent && cursor !== offsetParent) {
    if ($(cursor).css('transform') !== 'none') {
      return cursor;
    }
    cursor = cursor.parentElement;
  }
  return offsetParent;
}
