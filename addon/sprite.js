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

export default class Sprite {

  static positionedStartingAt(element) {
    return new this(element, true, 'position');
  }

  static positionedEndingAt(element) {
    return new this(element, false, 'position');
  }

  static sizedStartingAt(element) {
    return new this(element, true, 'size');
  }

  static sizedEndingAt(element) {
    return new this(element, false, 'size');
  }

  constructor(element, inInitialPosition, lockMode) {
    this.element = element;
    this.__$element = null;
    this.owner = null;

    let predecessor = inFlight.get(element);
    if (predecessor) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
      this._revealed = predecessor._revealed;
      this._transform = predecessor.transform;
      this._imposedStyle = predecessor._imposedStyle;
      this._effectiveOffsetParent = predecessor._effectiveOffsetParent;
      this._lockMode = predecessor._lockMode;
      if (lockMode !== predecessor._lockMode) {
        throw new Error("probably bug in ember-animated: can't change lock mode");
      }
    } else {
      this._styleCache = null;
      this._parentElement = null;
      this._revealed = null;
      this._transform = null;
      this._imposedStyle = null;
      this._effectiveOffsetParent = null;
      this._lockMode = lockMode;
      if (lockMode === 'position') {
        this._rememberPosition();
      } else if (this._lockMode === 'size') {
        this._rememberSize();
      }
    }

    if (inInitialPosition) {
      this.initialBounds = element.getBoundingClientRect();
      this.finalBounds = null;
    } else {
      this.initialBounds = null;
      this.finalBounds = element.getBoundingClientRect();
    }

    if (Ember.testing) { Object.seal(this); }
  }

  measureInitialBounds() {
    if (this.initialBounds) {
      throw new Error("Sprite already has initial bounds");
    }
    this.initialBounds = this.element.getBoundingClientRect();
  }

  measureFinalBounds() {
    if (this.finalBounds) {
      throw new Error("Sprite already has final bounds");
    }
    this.finalBounds = this.element.getBoundingClientRect();
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
    this.translate(otherSprite.initialBounds.left - this.finalBounds.left, otherSprite.initialBounds.top - this.finalBounds.top);
    this.initialBounds = otherSprite.initialBounds;
  }
  startTranslatedBy(dx, dy) {
    this.initialBounds = shiftedBounds(this.finalBounds, dx, dy);
    this.translate(this.initialBounds.left - this.finalBounds.left, this.initialBounds.top - this.finalBounds.top);
  }
  endTranslatedBy(dx, dy) {
    this.finalBounds = shiftedBounds(this.initialBounds, dx, dy);
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

function shiftedBounds(bounds, dx, dy) {
  return {
    top: bounds.top + dy,
    bottom: bounds.bottom + dy,
    left: bounds.left + dx,
    right: bounds.right + dx,
    width: bounds.width,
    height: bounds.height
  };
}
