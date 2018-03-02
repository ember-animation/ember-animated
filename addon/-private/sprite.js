/*
   A Sprite is our handle to a DOM element that we want to animate.

   It manages locking and unlocking the element (which means taking it
   in and out of static document flow so it's readily animatable).

   It tracks the sprite's current transform.

   It tracks the sprite's initial and/or final bounds, as measured
   from the actual pre- and/or post-animation DOM.

*/

import { warn } from '@ember/debug';

import $ from 'jquery';
import Ember from 'ember';
import Transform, {
  ownTransform,
  cumulativeTransform,
} from '../transform';
import { continueMotions } from '..';
import { collapsedChildren } from './margin-collapse';
import {
  shiftedBounds,
  relativeBounds,
  resizedBounds
} from './bounds';

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
    this._transform = null;
    this._offsetSprite = offsetSprite;

    // This gets set by TransitionContext when a sprite is used within
    // a TransitionContext. It's a convenience that allows users to
    // just pass Sprites to Motions without also passing the context.
    this._transitionContext = null;

    let predecessor = inFlight.get(element);
    if (predecessor && lockMode) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._parentElement = predecessor._parentElement;
      this._revealed = predecessor._revealed;
      this._imposedStyle = predecessor._imposedStyle;
      this._collapsingChildren = predecessor._collapsingChildren;
      this._lockMode = predecessor._lockMode;
      if (lockMode !== predecessor._lockMode) {
        throw new Error(`probable bug in ember-animated: can't change lock mode from ${predecessor._lockMode} to ${lockMode}`);
      }
    } else {
      this._styleCache = null;
      this._parentElement = null;
      this._revealed = null;
      this._imposedStyle = null;
      this._collapsingChildren = null;
      this._lockMode = lockMode;
      if (lockMode === 'position') {
        this._rememberPosition();
        this._cacheOriginalStyles();
      } else if (this._lockMode === 'size') {
        this._rememberSize();
        this._cacheOriginalStyles();
      }
    }

    this._lockedToInitialPosition = inInitialPosition;
    if (inInitialPosition) {
      this.measureInitialBounds();
      this.finalOpacity = null;
      this.finalBounds = null;
      this._finalPosition = null;
    } else {
      this.initialOpacity = null;
      this.initialBounds = null;
      this._initialPosition = null;
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

  // This deliberately only tracks inline styles, because it's only
  // important when the user is manipulating inline styles.
  _getCurrentPosition() {
    let style = this.element.style;
    return {
      top: style.top,
      left: style.left,
      bottom: style.bottom,
      right: style.right,
      transform: style.transform
    };
  }

  _reapplyPosition(pos) {
    if (pos) {
      let style = this.element.style;
      style.top = pos.top;
      style.left = pos.left;
      style.right = pos.right;
      style.bottom = pos.bottom;
      style.transform = pos.transform;
    }
  }

  measureInitialBounds() {
    if (this.initialBounds) {
      throw new Error("Sprite already has initial bounds");
    }
    this._inInitialPosition = true;
    if (this._offsetSprite) {
      this.initialBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.initialBounds);
    } else {
      this.initialBounds = this.element.getBoundingClientRect();
    }
    this.initialOpacity = parseFloat(getComputedStyle(this.element).opacity);
    this._initialPosition = this._getCurrentPosition();
  }

  measureFinalBounds() {
    if (this.finalBounds) {
      throw new Error("Sprite already has final bounds");
    }
    this._inInitialPosition = false;
    if (this._offsetSprite) {
      this.finalBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.finalBounds);
    } else {
      this.finalBounds = this.element.getBoundingClientRect();
    }
    this.finalOpacity = parseFloat(getComputedStyle(this.element).opacity);
    this._finalPosition = this._getCurrentPosition();
  }

  // this.difference('initialBounds', other, 'finalBounds') means "the
  // difference between this sprite's initial bounds and the other
  // sprite's final bounds".
  //
  // It works this way because each sprite has its own local
  // coordinate system.
  difference(which, otherSprite, otherWhich) {
    let x = this[which].left;
    let y = this[which].top;
    if (this._offsetSprite) {
      x += this._offsetSprite[which].left;
      y += this._offsetSprite[which].top;
    }
    if (otherSprite._offsetSprite) {
      x -= otherSprite._offsetSprite[otherWhich].left;
      y -= otherSprite._offsetSprite[otherWhich].top;
    }
    return {
      dx: x - otherSprite[otherWhich].left,
      dy: y - otherSprite[otherWhich].top
    };
  }

  set element(value) {
    this.__element = value;
    this.__$element = null;
  }

  get element() {
    return this.__element;
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
      this._revealed = !this._$element.hasClass('ember-animated-hidden');
    }
    return this._revealed;
  }

  _rememberSize() {
    this._imposedStyle = {};

    // If the user has already provided an inline width or height,
    // they are taking the wheel and we have to trust them to do
    // something reasonable.
    //
    // I'm not using getComputedStyle here because its width and
    // height are fairly useless for our purposes (we want "computed"
    // values, but for backward compat with CSS 2.0, getComputedStyle
    // actually returns the "used" values for width and height).

    if (this.element.style.width === "") {
      this._imposedStyle.width = this.element.offsetWidth;
      // TODO: do a more sophisticated size measurement so we don't
      // need to impose border-box. If we're only imposing width OR
      // height and we weren't originally in border box, we can get an
      // incorrect change in the non-imposed dimension.
      this._imposedStyle['box-sizing'] = 'border-box';
    }
    if (this.element.style.height === "") {
      this._imposedStyle.height = this.element.offsetHeight;
      this._imposedStyle['box-sizing'] = 'border-box';
    }
  }

  _lazyOffsets(computedStyle) {
    let offsets;
    return () => {
      if (!offsets) {
          offsets = findOffsets(this.element, computedStyle, this.transform, this._offsetSprite);
      }
      return offsets;
    }
  }

  _rememberPosition() {
    let computedStyle = getComputedStyle(this.element);
    let style = this.element.style;
    let offsets = this._lazyOffsets(computedStyle);
    let tx = 0;
    let ty = 0;

    this._rememberSize();

    if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
      this._imposedStyle.position = 'absolute';
    }

    if (style.top === ""  && style.bottom === "") {
      // The user had no preexisting inline vertical positioning, so we take over.
      this._imposedStyle.top = offsets().top;
      this._imposedStyle.marginTop = 0;
    } else if (this._imposedStyle.position) {
      // the user has inline styles for controlling vertical position,
      // but the element was not absolutely positioned, so we apply an
      // offseting transform.
      ty = offsets().top - parseFloat(computedStyle.top);
    }

    if (style.left === "" && style.bottom === "") {
      // The user had no preexisting inline horizontal positioning, so we take over.
      this._imposedStyle.left = offsets().left;
      this._imposedStyle.marginLeft = 0;
    } else if (this._imposedStyle.position) {
      // the user has inline styles for controlling vertical position,
      // but the element was not absolutely positioned, so we apply an
      // offseting transform.
      tx = offsets().left - parseFloat(computedStyle.left);
    }
    if (tx || ty) {
      this._transform = this.transform.mult(new Transform(1, 0, 0, 1, tx, ty));
      this._imposedStyle.transform = this.transform.serialize();
    }

    this._collapsingChildren = collapsedChildren(this.element, computedStyle, 'Top');
  }

  _cacheOriginalStyles() {
    let cache = {};
    let style = this.element.style;
    Object.keys(this._imposedStyle).forEach(property => {
      cache[property] = style[property];
    });
    this._styleCache = cache;
  }

  lock() {
    // In case the user has caused our inline-style-driven position
    // to drift, we put it back.
    this._reapplyPosition(this._initialPosition);

    this.applyStyles(this._imposedStyle);
    if (this._lockMode === 'position') {
      this._handleMarginCollapse();
    }
    inFlight.set(this.element, this);
    this._inInitialPosition = this._lockedToInitialPosition;
  }

  unlock() {
    warn("Probable bug in ember-animated: an interrupted sprite tried to unlock itself", this.stillInFlight(), { id: "ember-animated-sprite-unlock" });
    inFlight.delete(this.element);
    let style = this.element.style;
    let cache = this._styleCache;
    Object.keys(cache).forEach(property => {
      style[property] = cache[property];
    });

    // In case the user has caused our inline-style-driven position
    // to drift, we put it back.
    this._reapplyPosition(this._finalPosition);

    if (this._lockMode === 'position') {
      this._clearMarginCollapse();
    }
  }

  applyStyles(styles) {
    if (!this._lockMode) {
      throw new Error("can't apply styles to non-lockable sprite");
    }
    if (styles !== this._imposedStyle) {
      Object.keys(styles).forEach(property => {
        if (this._imposedStyle[property] == null) {
          this._styleCache[property] = this.element.style[property];
        }
        this._imposedStyle[property] = styles[property];
      });
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

  // translate the sprite by the given number of screen pixels, regardless of any preexisting transform
  translate(dx, dy) {
    let t = this.transform;
    t = t.mult(new Transform(1, 0, 0, 1, dx / t.a, dy / t.d));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize(),
      transformOrigin: '0 0'
    });
  }

  scale(scaleX, scaleY) {
    let t = this.transform.mult(new Transform(scaleX, 0, 0, scaleY, 0, 0));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize(),
      transformOrigin: '0 0'
    });
  }

  // Adjust the sprite so it will still be in the same visual position
  // despite being moved into a new offset parent.
  rehome(newOffsetSprite) {
    let screenBounds = shiftedBounds(this.initialBounds, this._offsetSprite.initialBounds.left, this._offsetSprite.initialBounds.top);
    let newRelativeBounds = shiftedBounds(screenBounds, -newOffsetSprite.initialBounds.left, -newOffsetSprite.initialBounds.top);

    let t = this.transform;
    t = t.mult(new Transform(1, 0, 0, 1, (newRelativeBounds.left - t.tx)/t.a, (newRelativeBounds.top - t.ty)/t.d));
    this._transform = t;
    this._imposedStyle.transform = t.serialize();
    this._imposedStyle.transformOrigin = '0 0';
    this._imposedStyle.top = 0;
    this._imposedStyle.left = 0;
    this._offsetSprite = newOffsetSprite;
    this.initialBounds = newRelativeBounds;
    this._inInitialPosition = true;
  }

  _handleMarginCollapse() {
    let children = this._collapsingChildren;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.add('ember-animated-top-collapse');
    }
  }
  _clearMarginCollapse() {
    let children = this._collapsingChildren;
    for (let i = 0; i < children.length; i++) {
      children[i].classList.remove('ember-animated-top-collapse');
    }
  }
  startAtSprite(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    let diff = this.difference('finalBounds', otherSprite, 'initialBounds');
    this.startTranslatedBy(-diff.dx, -diff.dy);
    this.initialBounds = resizedBounds(this.initialBounds, otherSprite.initialBounds.width, otherSprite.initialBounds.height);
    this.initialOpacity = otherSprite.initialOpacity;
  }

  startAtPixel({ x, y }) {
    let dx = 0;
    let dy = 0;
    if (x != null) {
      dx = x - this.finalBounds.left;
      if (this._offsetSprite) {
        dx -= this._offsetSprite.finalBounds.left;
      }
    }
    if (y != null) {
      dy = y - this.finalBounds.top;
      if (this._offsetSprite) {
        dy -= this._offsetSprite.finalBounds.top;
      }
    }
    this.startTranslatedBy(dx, dy);
  }

  // set our initialBounds relative to our finalBounds
  startTranslatedBy(dx, dy) {
    let priorInitialBounds = this.initialBounds;
    let offsetX = 0;
    let offsetY = 0;
    if (this._offsetSprite) {
      offsetX = this._offsetSprite.finalBounds.left - this._offsetSprite.initialBounds.left;
      offsetY = this._offsetSprite.finalBounds.top - this._offsetSprite.initialBounds.top;
    }
    this.initialBounds = shiftedBounds(this.finalBounds, dx-offsetX, dy-offsetY);

    if (this._inInitialPosition) {
      // we were already moved into our priorInitiaBounds position, so we need to compensate
      this.translate(this.initialBounds.left - priorInitialBounds.left, this.initialBounds.top - priorInitialBounds.top);
    } else {
      this.translate(this.initialBounds.left - this.finalBounds.left, this.initialBounds.top - this.finalBounds.top);
      this._inInitialPosition = true;
    }

  }

  moveToFinalPosition() {
    if (this._inInitialPosition) {
      let initial = this.initialBounds;
      let final = this.finalBounds;
      let dx = final.left - initial.left;
      let dy = final.top - initial.top;
      this.translate(dx, dy);
      this._inInitialPosition = false;
    }
  }

  endAtSprite(otherSprite) {
    let diff = otherSprite.difference('finalBounds', this, 'initialBounds');
    this.endTranslatedBy(diff.dx, diff.dy);
    this.finalBounds = resizedBounds(this.finalBounds, otherSprite.finalBounds.width, otherSprite.finalBounds.height);
    this.finalOpacity = otherSprite.finalOpacity;
  }

  endAtPixel({ x, y }) {
    let dx = 0;
    let dy = 0;
    if (x != null) {
      dx = x - this.initialBounds.left;
      if (this._offsetSprite) {
        dx -= this._offsetSprite.initialBounds.left;
      }
    }
    if (y != null) {
      dy = y - this.initialBounds.top;
      if (this._offsetSprite) {
        dy -= this._offsetSprite.initialBounds.top;
      }
    }
    this.endTranslatedBy(dx, dy);
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
