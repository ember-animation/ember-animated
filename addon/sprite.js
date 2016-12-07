import $ from 'jquery';
import Ember from 'ember';
import {
  ownTransform,
  cumulativeTransform,
  Transform
} from './transform';
import { continueMotions } from './motion';


const inFlight = new WeakMap();

export default class Sprite {
  constructor(element, component, asContainer=false) {
    let predecessor = inFlight.get(element);
    if (predecessor) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
    } else {
      this._styleCache = $(element).attr('style') || null;
      this._parentElement = element.parentElement;
    }
    this.component = component;
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
  replaces(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    this.translate(otherSprite.initialBounds.left - this.finalBounds.left, otherSprite.initialBounds.top - this.finalBounds.top);
    this.initialBounds = otherSprite.initialBounds;
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
  reveal() {
    $(this.element).removeClass('ember-animated-hidden');
  }
  append() {
    $(this._parentElement).append(this.element);
  }
  remove() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
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
