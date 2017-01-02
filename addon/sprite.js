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
import { shiftedBounds, relativeBounds } from './bounds';

const inFlight = new WeakMap();

export default class Sprite {

  static offsetParentStartingAt(element) {
    let parent = getEffectiveOffsetParent(element);
    if (!parent) {
      parent = document.getElementsByTagName('body')[0];
    }
    return new this(parent, true, null, null);
  }

  static offsetParentEndingAt(element) {
    let parent = getEffectiveOffsetParent(element);
    if (!parent) {
      parent = document.getElementsByTagName('body')[0];
    }
    return new this(parent, false, null, null);
  }

  static positionedStartingAt(element, offsetSprite) {
    if (!offsetSprite.initialBounds) {
      throw new Error("offset sprite must have initial bounds");
    }
    return new this(element, true, 'position', offsetSprite);
  }

  static positionedEndingAt(element, offsetSprite) {
    if (!offsetSprite.finalBounds) {
      throw new Error("offset sprite must have final bounds");
    }
    return new this(element, false, 'position', offsetSprite);
  }

  static sizedStartingAt(element) {
    return new this(element, true, 'size', null);
  }

  static sizedEndingAt(element) {
    return new this(element, false, 'size', null);
  }

  constructor(element, inInitialPosition, lockMode, offsetSprite) {
    this.element = element;
    this.__$element = null;
    this.owner = null;
    this._offsetSprite = offsetSprite;

    let predecessor = inFlight.get(element);
    if (predecessor && lockMode) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
      this._revealed = predecessor._revealed;
      this._transform = predecessor.transform;
      this._imposedStyle = predecessor._imposedStyle;
      this._lockMode = predecessor._lockMode;
      if (lockMode !== predecessor._lockMode) {
        throw new Error(`probable bug in ember-animated: can't change lock mode from ${predecessor._lockMode} to ${lockMode}`);
      }
    } else {
      this._styleCache = null;
      this._parentElement = null;
      this._revealed = null;
      this._transform = null;
      this._imposedStyle = null;
      this._lockMode = lockMode;
      if (lockMode === 'position') {
        this._rememberPosition();
      } else if (this._lockMode === 'size') {
        this._rememberSize();
      }
    }

    if (inInitialPosition) {
      this.measureInitialBounds();
      this.finalBounds = null;
    } else {
      this.initialBounds = null;
      this.measureFinalBounds();
    }

    if (Ember.testing) { Object.seal(this); }
  }

  getCurrentBounds() {
    if (this._offsetSprite) {
      return relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.getCurrentBounds());
    } else {
      return this.element.getBoundingClientRect();
    }
  }

  measureInitialBounds() {
    if (this.initialBounds) {
      throw new Error("Sprite already has initial bounds");
    }
    if (this._offsetSprite) {
      this.initialBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.initialBounds);
    } else {
      this.initialBounds = this.element.getBoundingClientRect();
    }
  }

  measureFinalBounds() {
    if (this.finalBounds) {
      throw new Error("Sprite already has final bounds");
    }
    if (this._offsetSprite) {
      this.finalBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.finalBounds);
    } else {
      this.finalBounds = this.element.getBoundingClientRect();
    }
  }

  get _$element() {
    if (!this.__$element) {
      this.__$element = $(this.element);
    }
    return this.__$element;
  }

  get transform() {
    if (!this._transform) {
      this._transform = ownTransform(this.element);
    }
    return this._transform;
  }

  get revealed() {
    if (this._revealed == null) {
      this._revealed = this._$element.hasClass('ember-animated-hidden');
    }
    return this._revealed;
  }

  _rememberSize() {
    this._styleCache = this._$element.attr('style') || "";
    this._imposedStyle = {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      'box-sizing': 'border-box'
    };
  }

  _rememberPosition() {
    this._styleCache = this._$element.attr('style') || "";
    let computedStyle = getComputedStyle(this.element);
    let { top, left } = findOffsets(this.element, computedStyle, this.transform, this._offsetSprite);
    this._imposedStyle = {
      top,
      left,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      position: computedStyle.position === 'fixed' ? 'fixed' : 'absolute',
      'box-sizing': 'border-box',
      margin: 0
    };
  }

  lock() {
    if (!this._lockMode) {
      throw new Error("sprite is not lockable");
    }
    this.applyStyles(this._imposedStyle);
    if (this._lockMode === 'position') {
      this._handleMarginCollapse();
    }
    inFlight.set(this.element, this);
  }

  unlock() {
    Ember.warn("Probable bug in ember-animated: an interrupted sprite tried to unlock itself", this.stillInFlight(), { id: "ember-animated-sprite-unlock" });
    inFlight.delete(this.element);
    if (this._styleCache.length > 0) {
      this._$element.attr('style', this._styleCache);
    } else {
      this.element.attributes.removeNamedItem('style');
    }
    if (this._lockMode === 'position') {
      this._clearMarginCollapse();
    }
  }

  applyStyles(styles) {
    if (!this._lockMode) {
      throw new Error("can't apply styles to non-lockable sprite");
    }
    if (styles !== this._imposedStyle) {
      Object.assign(this._imposedStyle, styles);
    }
    this._$element.css(styles);
  }

  stillInFlight() {
    return inFlight.get(this.element) === this;
  }

  hide() {
    this._revealed = false;
    this._$element.addClass('ember-animated-hidden');
  }

  reveal() {
    if (!this.revealed) {
      this._revealed = true;
      this._$element.removeClass('ember-animated-hidden');
    }
  }

  display(flag) {
    if (flag) {
      this._$element.removeClass('ember-animated-none');
    } else {
      this._$element.addClass('ember-animated-none');
    }
  }

  translate(dx, dy) {
    let t = this.transform.mult(new Transform(1, 0, 0, 1, dx, dy));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize()
    });
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
  startAt(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    this.startTranslatedBy(otherSprite.initialBounds.left - this.finalBounds.left, otherSprite.initialBounds.top - this.finalBounds.top);
  }
  startTranslatedBy(dx, dy) {
    let offsetX = 0;
    let offsetY = 0;
    if (this._offsetSprite) {
      offsetX = this._offsetSprite.finalBounds.left - this._offsetSprite.initialBounds.left;
      offsetY = this._offsetSprite.finalBounds.top - this._offsetSprite.initialBounds.top;
    }
    this.initialBounds = shiftedBounds(this.finalBounds, dx-offsetX, dy-offsetY);
    this.translate(this.initialBounds.left - this.finalBounds.left, this.initialBounds.top - this.finalBounds.top);
  }
  endTranslatedBy(dx, dy) {
    this.finalBounds = shiftedBounds(this.initialBounds, dx, dy);
  }
  endRelativeTo(otherSprite) {
    this.endTranslatedBy(otherSprite.finalBounds.left - otherSprite.initialBounds.left, otherSprite.finalBounds.top - otherSprite.initialBounds.top);
  }
}

function findOffsets(element, computedStyle, transform, offsetSprite) {
  let ownBounds = element.getBoundingClientRect();
  let left = ownBounds.left;
  let top = ownBounds.top;
  let effectiveOffsetParent;

  if (computedStyle.position !== 'fixed') {
    effectiveOffsetParent = offsetSprite.element;
  }

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

  return { top, left };
}

// This compensates for the fact that browsers are inconsistent in the
// way they report offsetLeft & offsetTop for elements with a
// transformed ancestor beneath their nearest positioned ancestor.
function getEffectiveOffsetParent(element) {
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
