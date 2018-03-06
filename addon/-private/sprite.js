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
} from './transform';
import { continueMotions } from '..';
import { collapsedChildren } from './margin-collapse';
import {
  shiftedBounds,
  relativeBounds,
  resizedBounds,
  emptyBounds
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
    let sprite = new this(element, false, 'size', null);
    sprite._initialBounds = emptyBounds;
    return sprite;
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
      this._finalOpacity = null;
      this._finalBounds = null;
      this._originalFinalBounds = null;
      this._finalPosition = null;
    } else {
      this._initialOpacity = null;
      this._initialBounds = null;
      this._originalInitialBounds = null;
      this._initialPosition = null;
      this.measureFinalBounds();
    }

    if (Ember.testing) { Object.seal(this); }
  }

  // A DOMRect representing the place where this sprite will start the
  // transition. Not every sprite has initialBounds (a newly inserted
  // sprite will not -- it will only have finalBounds).
  //
  // The position is measured *relative* to our offsetParent, if we
  // have one. Most of the time we want motions to act in relative
  // terms, so that if we're inside another animator things still work
  // out correctly.
  //
  // You can manipulate initialBounds using methods like startAtPixel.
  //
  // Motions should look at initialBounds and finalBounds to decide
  // what to do.
  get initialBounds() {
    return this._initialBounds;
  }

  // A DOMRect representing the place where this sprite will end the
  // transition. Not every sprite has finalBounds (a sprite that is
  // about to be destroyed will not -- it will only have
  // initialBounds).
  //
  // The position is measured *relative* to our offsetParent, if we
  // have one. Most of the time we want motions to act in relative
  // terms, so that if we're inside another animator things still work
  // out correctly.
  //
  // You can manipulate finalBounds using methods like endAtPixel.
  get finalBounds() {
    return this._finalBounds;
  }

  // a Number representing this sprite's opacity at the start of the
  // transition.
  get initialOpacity() {
    return this._initialOpacity;
  }

  // a Number representing this sprite's opacity at the end of the
  // transition.
  get finalOpacity() {
    return this._finalOpacity;
  }

  // This is mostly intended for use with SVG, where you can say things like getInitialDimension('x')
  getInitialDimension(name) {
    return this._initialPosition[name];
  }

  // This is mostly intended for use with SVG, where you can say things like getFinalDimension('x')
  getFinalDimension(name) {
    return this._finalPosition[name];
  }

  // Some things methods (like startAtSprite, startAtPixel, etc) can
  // set or alter the initialBounds. This gives you access to the
  // original value (which may be undefined if this sprite didn't have
  // any initial bounds, which is the case for newly inserted
  // sprites).
  get originalInitialBounds() {
    return this._originalInitialBounds;
  }

  // Some things (like endAtSprite) can alter the finalBounds. This
  // gives you access to the original value (which may be undefined if
  // the sprite didn't have any final bounds, which is the case for
  // removedSprites).
  get originalFinalBounds() {
    return this._originalFinalBounds;
  }

  // TODO: this is used only in tests, and it's a temptation toward DOM thrashing. Remove it.
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
    if (isSVG(this.element)) {
      let { element } = this;
      return {
        x: getSVGLength(element, 'x'),
        y: getSVGLength(element, 'y'),
        cx: getSVGLength(element, 'cx'),
        cy: getSVGLength(element, 'cy'),
        r: getSVGLength(element, ('r')),
        width: getSVGLength(element, 'width'),
        height: getSVGLength(element, 'height'),
        transform: element.getAttribute('transform')
      }
    } else {
      let style = this.element.style;
      return {
        top: style.top,
        left: style.left,
        bottom: style.bottom,
        right: style.right,
        transform: style.transform
      };
    }
  }

  _reapplyPosition(pos) {
    if (!pos) { return; }
    if (isSVG(this.element)) {
      let { element } = this;
      setSVGLength(element, 'x', pos);
      setSVGLength(element, 'y', pos);
      setSVGLength(element, 'cx', pos);
      setSVGLength(element, 'cy', pos);
      setSVGLength(element, 'r', pos);
      setSVGLength(element, 'width', pos);
      setSVGLength(element, 'height', pos);
      setAttribute(element, 'transform', pos);
    } else {
      let style = this.element.style;
      style.top = pos.top;
      style.left = pos.left;
      style.right = pos.right;
      style.bottom = pos.bottom;
      style.transform = pos.transform;
    }
  }

  measureInitialBounds() {
    if (this._initialBounds) {
      throw new Error("Sprite already has initial bounds");
    }
    this._inInitialPosition = true;
    if (this._offsetSprite) {
      this._initialBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.initialBounds);
    } else {
      this._initialBounds = this.element.getBoundingClientRect();
    }
    this._initialOpacity = parseFloat(getComputedStyle(this.element).opacity);
    this._initialPosition = this._getCurrentPosition();
    this._originalInitialBounds = this._initialBounds;
  }

  measureFinalBounds() {
    if (this._finalBounds) {
      throw new Error("Sprite already has final bounds");
    }
    this._inInitialPosition = false;
    if (this._offsetSprite) {
      this._finalBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.finalBounds);
    } else {
      this._finalBounds = this.element.getBoundingClientRect();
    }
    this._finalOpacity = parseFloat(getComputedStyle(this.element).opacity);
    this._finalPosition = this._getCurrentPosition();
    this._originalFinalBounds = this._finalBounds;
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

  // The sprite's current transform, with appropriate caching so that
  // you don't trigger reflows.
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

    if (isSVG(this.element)) {
      // we're not doing anything to lock the width & height
      // SVGElements. it seems rare that we'd need to, since svg
      // layout tends to be pretty literal.
      return;
    }

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

    if (isSVG(this.element)) {
      // svg elements are effectively always already absolutely
      // positioned by their own coordinates.
      return;
    }

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
    this._handleMarginCollapse();
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

    this._clearMarginCollapse();
  }

  // This is your general purpose hook for changing CSS properties of
  // the sprite's element. Use this when there's not a more specific
  // method like translate(), scale(), hide(), or reveal().
  //
  // Nothing you do to the sprite will persist after the transition is
  // finished -- we clean things up when it ends.
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

  // Hide the sprite (using CSS visibility property).
  hide() {
    this._revealed = false;
    this._$element.addClass('ember-animated-hidden');
  }

  // Reveal the sprite (using CSS visibility property). Newly inserted
  // sprites start hidden, and are revealed when you start animating
  // them. You can manually reveal them with this if you want them to
  // appear right away and you're not animating them.
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

  // translate the sprite by the given number of screen pixels,
  // regardless of any preexisting transform
  translate(dx, dy) {
    let t = this.transform;
    t = t.mult(new Transform(1, 0, 0, 1, dx / t.a, dy / t.d));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize(),
      transformOrigin: '0 0'
    });
  }

  // adjust the sprite's scale by the given scaling factors
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
    let screenBounds = shiftedBounds(this._initialBounds, this._offsetSprite.initialBounds.left, this._offsetSprite.initialBounds.top);
    let newRelativeBounds = shiftedBounds(screenBounds, -newOffsetSprite.initialBounds.left, -newOffsetSprite.initialBounds.top);

    let t = this.transform;
    t = t.mult(new Transform(1, 0, 0, 1, (newRelativeBounds.left - t.tx)/t.a, (newRelativeBounds.top - t.ty)/t.d));
    this._transform = t;
    this._imposedStyle.transform = t.serialize();
    this._imposedStyle.transformOrigin = '0 0';
    this._imposedStyle.top = 0;
    this._imposedStyle.left = 0;
    this._offsetSprite = newOffsetSprite;
    this._initialBounds = newRelativeBounds;
    this._inInitialPosition = true;
  }

  _handleMarginCollapse() {
    if (this._collapsingChildren) {
      let children = this._collapsingChildren;
      for (let i = 0; i < children.length; i++) {
        children[i].classList.add('ember-animated-top-collapse');
      }
    }
  }
  _clearMarginCollapse() {
    if (this._collapsingChildren) {
      let children = this._collapsingChildren;
      for (let i = 0; i < children.length; i++) {
        children[i].classList.remove('ember-animated-top-collapse');
      }
    }
  }
  startAtSprite(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    let diff = this.difference('finalBounds', otherSprite, 'initialBounds');
    this.startTranslatedBy(-diff.dx, -diff.dy);
    this._initialBounds = resizedBounds(this._initialBounds, otherSprite.initialBounds.width, otherSprite.initialBounds.height);
    this._initialOpacity = otherSprite.initialOpacity;
  }

  startAtPixel({ x, y }) {
    let dx = 0;
    let dy = 0;
    if (x != null) {
      dx = x - this._finalBounds.left;
      if (this._offsetSprite) {
        dx -= this._offsetSprite.finalBounds.left;
      }
    }
    if (y != null) {
      dy = y - this._finalBounds.top;
      if (this._offsetSprite) {
        dy -= this._offsetSprite.finalBounds.top;
      }
    }
    this.startTranslatedBy(dx, dy);
  }

  // set our initialBounds relative to our finalBounds
  startTranslatedBy(dx, dy) {
    let priorInitialBounds = this._initialBounds;
    let offsetX = 0;
    let offsetY = 0;
    if (this._offsetSprite) {
      offsetX = this._offsetSprite.finalBounds.left - this._offsetSprite.initialBounds.left;
      offsetY = this._offsetSprite.finalBounds.top - this._offsetSprite.initialBounds.top;
    }
    this._initialBounds = shiftedBounds(this._finalBounds, dx-offsetX, dy-offsetY);

    if (this._inInitialPosition) {
      // we were already moved into our priorInitiaBounds position, so we need to compensate
      this.translate(this._initialBounds.left - priorInitialBounds.left, this._initialBounds.top - priorInitialBounds.top);
    } else {
      this.translate(this._initialBounds.left - this._finalBounds.left, this._initialBounds.top - this._finalBounds.top);
      this._inInitialPosition = true;
    }

  }

  moveToFinalPosition() {
    if (this._inInitialPosition) {
      let initial = this._initialBounds;
      let final = this._finalBounds;
      let dx = final.left - initial.left;
      let dy = final.top - initial.top;
      this.translate(dx, dy);
      this._inInitialPosition = false;
    }
  }

  endAtSprite(otherSprite) {
    let diff = otherSprite.difference('finalBounds', this, 'initialBounds');
    this.endTranslatedBy(diff.dx, diff.dy);
    this._finalBounds = resizedBounds(this._finalBounds, otherSprite.finalBounds.width, otherSprite.finalBounds.height);
    this._finalOpacity = otherSprite.finalOpacity;
  }

  endAtPixel({ x, y }) {
    let dx = 0;
    let dy = 0;
    if (x != null) {
      dx = x - this._initialBounds.left;
      if (this._offsetSprite) {
        dx -= this._offsetSprite.initialBounds.left;
      }
    }
    if (y != null) {
      dy = y - this._initialBounds.top;
      if (this._offsetSprite) {
        dy -= this._offsetSprite.initialBounds.top;
      }
    }
    this.endTranslatedBy(dx, dy);
  }


  endTranslatedBy(dx, dy) {
    this._finalBounds = shiftedBounds(this._initialBounds, dx, dy);
  }

  // sets this sprite's finalBounds so that this sprite's position
  // relative to otherSprite remains constant through the transition.
  //
  // otherSprite must have initial and final bounds.
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

const SVGNamespace = "http://www.w3.org/2000/svg";

// We have special handling for SVG elements inside SVG documents. An
// <svg> tag itself whose parent is not SVG doesn't need special
// handling -- it participates in normal HTML positioning.
function isSVG(element) {
  return element.namespaceURI === SVGNamespace && element.parentElement.namespaceURI === SVGNamespace;
}

// This distinguishes HTML vs SVG rules, and for HTML it compensates
// for the fact that browsers are inconsistent in the way they report
// offsetLeft & offsetTop for elements with a transformed ancestor
// beneath their nearest positioned ancestor.
function getEffectiveOffsetParent(element) {

  if (isSVG(element)) {
    let cursor = element.parentElement;
    while (cursor && cursor.namespaceURI === SVGNamespace) {
      if (cursor.tagName === 'svg') {
        return cursor;
      }
      cursor = cursor.parentElement;
    }
    // we should never fall through here -- presumably we must find an
    // <svg> tag somewhere before we exit the svg namespace. But if we
    // do fall through, I'll just let this continue into the regular
    // HTML rules below.
  }

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

function getSVGLength(element, property) {
  if (element[property]) {
    return element[property].baseVal.value;
  }
}

function setSVGLength(element, property, values) {
  if (typeof values[property] == 'number') {
    element[property].baseVal.value = values[property];
  }
}

function setAttribute(element, attrName, values) {
  if (values[attrName]) {
    element.setAttribute(attrName, values[attrName]);
  } else {
    element.removeAttribute(attrName);
  }
}
