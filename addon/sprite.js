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
import {
  ownTransform,
  cumulativeTransform,
  Transform
} from './transform';
import { continueMotions } from './motion';
import { rAF } from './concurrency-helpers';


const inFlight = new WeakMap();

export default class Sprite {
  constructor(element, asContainer=false) {
    let predecessor = inFlight.get(element);
    if (predecessor) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
      this._revealed = predecessor._revealed;
      this._needsAppend = predecessor._needsAppend;
      this._markedForDestruction = predecessor._markedForDestruction;
    } else {
      let $elt = $(element);
      this._styleCache = $elt.attr('style') || null;
      this._parentElement = element.parentElement;
      this._revealed = !$elt.hasClass('ember-animated-hidden');
      this._needsAppend = false;
      this._markedForDestruction = false;
    }
    this.element = element;
    this.initialBounds = null;
    this.finalBounds = null;
    if (asContainer) {
      this._initAsContainer();
    } else {
      this._initAsContained(predecessor);
    }
  }

  _initAsContainer() {
    this._imposedStyle = {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      'box-sizing': 'border-box'
    };
  }

  _initAsContained(predecessor) {
    if (predecessor) {
      this.transform = predecessor.transform;
      this._imposedStyle = predecessor._imposedStyle;
    } else {
      let computedStyle = getComputedStyle(this.element);
      this.transform = ownTransform(this.element);
      let { top, left } = findOffsets(this.element, computedStyle, this.transform);
      this._imposedStyle = {
        top,
        left,
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
        position: computedStyle.position === 'fixed' ? 'fixed' : 'absolute',
        'box-sizing': 'border-box'
      };
    }
  }
  measureInitialBounds() {
    this.initialBounds = this.element.getBoundingClientRect();
  }
  measureFinalBounds() {
    this.finalBounds = this.element.getBoundingClientRect();
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
  lock() {
    $(this.element).css(this._imposedStyle);
    inFlight.set(this.element, this);
  }
  applyStyles(styles) {
    Object.assign(this._imposedStyle, styles);
    $(this.element).css(styles);
  }
  translate(dx, dy) {
    let t = this.transform.mult(new Transform(1, 0, 0, 1, dx, dy));
    this.transform = t;
    this.applyStyles({
      transform: t.serialize()
    });
  }
  unlock() {
    Ember.warn("Probable bug in ember-animated: an interrupted sprite tried to unlock itself", inFlight.get(this.element) === this, { id: "ember-animated-sprite-unlock" });
    inFlight.delete(this.element);
    if (this._styleCache) {
      $(this.element).attr('style', this._styleCache);
    } else {
      this.element.attributes.removeNamedItem('style');
    }
  }
  motionEnded() {
    if (this._markedForDestruction) {
      rAF().then(() => {
        if (inFlight.get(this.element) === this) {
          if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
          }
        }
      })
    }
  }
  isMarkedForDestruction() {
    return this._markedForDestruction
  }
  markedForDestruction() {
    if (!this._markedForDestruction) {
      this._markedForDestruction = true;
      this._needsAppend = true;
    }
  }
  hide() {
    this._revealed = false;
    $(this.element).addClass('ember-animated-hidden');
  }
  reveal() {
    if (this._needsAppend) {
      $(this._parentElement).append(this.element);
      this.lock();
    }
    if (!this._revealed) {
      this._revealed = true;
      $(this.element).removeClass('ember-animated-hidden');
    }
  }
}

function findOffsets(element, computedStyle, transform) {
  let ownBounds = element.getBoundingClientRect();
  let left = ownBounds.left;
  let top = ownBounds.top;
  let [effectiveOffsetParent, eopComputedStyle] = getEffectiveOffsetParent(element, computedStyle);
  if (effectiveOffsetParent) {
    let eopBounds = effectiveOffsetParent.getBoundingClientRect();
    left -= eopBounds.left + parseFloat(eopComputedStyle.borderLeftWidth);
    top -= eopBounds.top + parseFloat(eopComputedStyle.borderTopWidth);
  }

  left -= parseFloat(computedStyle.marginLeft);
  top -= parseFloat(computedStyle.marginTop);

  if (effectiveOffsetParent) {
    let eopTransform = cumulativeTransform(effectiveOffsetParent);
    left /= eopTransform.a;
    top /= eopTransform.d;
  }

  left -= transform.tx;
  top -= transform.ty;

  return { top, left };
}

// This compensates for the fact that browsers are inconsistent in the
// way they report offsetLeft & offsetTop for elements with a
// transformed ancestor beneath their nearest positioned ancestor.
//
// Returns both the effective offset parent and its computed style
// (since we had to computed that anyway and don't want to compute it
// again later).
function getEffectiveOffsetParent(element, computedStyle) {
  if (computedStyle.position === 'fixed') { return [null, null]; }
  let offsetParent = element.offsetParent;
  let cursor = element.parentElement;
  while (cursor && offsetParent && cursor !== offsetParent) {
    if ($(cursor).css('transform') !== 'none') {
      return [cursor, getComputedStyle(cursor)];
    }
    cursor = cursor.parentElement;
  }
  let style = getComputedStyle(offsetParent);
  if (style.position === 'static' && style.transform === 'none') {
    // You can end up with the body as your effective offset parent
    // even when the body is statically positioned, which will mess
    // you up if it has any margins (including collapsed margins from
    // its descendants).
    return [null, null];
  }
  return [offsetParent, style];
}
