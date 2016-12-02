import $ from 'jquery';
import Ember from 'ember';
import {
  ownTransform,
  cumulativeTransform,
  Transform
} from './transform';

const inFlight = new WeakMap();

export default class Sprite {
  constructor(element, component, asContainer=false) {
    this.component = component;
    this.element = element;
    this._parentElement = element.parentElement;
    let transform = ownTransform(element);
    if (asContainer) {
      this._imposedStyle = {
        width: element.offsetWidth,
        height: element.offsetHeight,
        'box-sizing': 'border-box'
      };
    } else {
      let computedStyle = getComputedStyle(element);
      let { top, left } = offsets(element, computedStyle, transform);
      this._imposedStyle = {
        top,
        left,
        width: element.offsetWidth,
        height: element.offsetHeight,
        position: computedStyle.position === 'fixed' ? 'fixed' : 'absolute',
        'box-sizing': 'border-box'
      };
    }
    let predecessor = inFlight.get(element);
    if (predecessor) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking
      // things.
      this._styleCache = predecessor._styleCache;
    } else {
      this._styleCache = $(element).attr('style') || null;
    }
    this.initialBounds = null;
    this.finalBounds = null;
    this.transform = transform;
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
  translate(dx, dy) {
    let t = this.transform.mult(new Transform(1, 0, 0, 1, dx, dy));
    this.transform = t;
    $(this.element).css('transform', t.serialize());
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

function offsets(element, computedStyle, transform) {
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
