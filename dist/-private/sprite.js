import { warn } from '@ember/debug';
import Ember from 'ember';
import Transform, { cumulativeTransform, ownTransform } from './transform.js';
import { continueMotions } from './motion-bridge.js';
import { collapsedChildren } from './margin-collapse.js';
import { emptyBounds, shiftedBounds, relativeBounds, resizedBounds } from './bounds.js';
import { getOrCreate } from './singleton.js';

const inFlight = getOrCreate('sprite', () => new WeakMap());

/**
  A Sprite is our handle to a DOM element that we want to animate.

  It manages locking and unlocking the element (which means taking it
  in and out of static document flow so it's readily animatable).

  It tracks the sprite's current transform.

  It tracks the sprite's initial and/or final bounds, as measured
  from the actual pre- and/or post-animation DOM.

  @class Sprite
*/
class Sprite {
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
      throw new Error('offset sprite must have initial bounds');
    }
    return new this(element, true, 'position', offsetSprite);
  }
  static positionedEndingAt(element, offsetSprite) {
    if (!offsetSprite.finalBounds) {
      throw new Error('offset sprite must have final bounds');
    }
    return new this(element, false, 'position', offsetSprite);
  }
  static sizedStartingAt(element) {
    return new this(element, true, 'size', null);
  }
  static sizedEndingAt(element) {
    let sprite = new this(element, false, 'size', null);
    sprite._initialBounds = emptyBounds;
    sprite._initialComputedStyle = sprite._finalComputedStyle;
    sprite._initialPosition = sprite._finalPosition;
    sprite._originalInitialBounds = sprite._initialBounds;
    sprite._initialCumulativeTransform = sprite._finalCumulativeTransform;
    return sprite;
  }
  __element;
  owner = null;
  _transform = null;
  _cumulativeTransform = null;
  _offsetSprite;
  _lockedToInitialPosition;
  _finalComputedStyle = null;
  _finalBounds = null;
  _originalFinalBounds = null;
  _finalPosition = null;
  _finalCumulativeTransform = null;
  _initialComputedStyle = null;
  _initialBounds = null;
  _originalInitialBounds = null;
  _initialPosition = null;
  _initialCumulativeTransform = null;
  _revealed;
  _imposedStyle = null;
  _styleCache = null;
  _collapsingChildren = null;
  _lockMode;
  _inInitialPosition = false;
  constructor(element, inInitialPosition, lockMode, offsetSprite) {
    this.element = element;
    this._offsetSprite = offsetSprite;
    this._lockedToInitialPosition = inInitialPosition;
    if (inInitialPosition) {
      this.measureInitialBounds();
    } else {
      this.measureFinalBounds();
    }
    let predecessor = inFlight.get(element);
    if (predecessor && lockMode) {
      // When we finish, we want to be able to set the style back to
      // whatever it was before any Sprites starting locking things,
      // so inheriting the state from our predecessor is important for
      // correctness.
      this._styleCache = predecessor._styleCache;
      this._revealed = predecessor._revealed;
      this._imposedStyle = predecessor._imposedStyle;
      this._collapsingChildren = predecessor._collapsingChildren;
      this._lockMode = predecessor._lockMode;
      if (lockMode !== predecessor._lockMode) {
        throw new Error(`probable bug in ember-animated: can't change lock mode from ${predecessor._lockMode} to ${lockMode}`);
      }
    } else {
      this._styleCache = null;
      this._revealed = null;
      this._lockMode = lockMode;
      if (lockMode === 'position') {
        this._rememberPosition();
        this._cacheOriginalStyles();
      } else if (this._lockMode === 'size') {
        this._rememberSize();
        this._cacheOriginalStyles();
      }
    }
    if (Ember.testing) {
      Object.seal(this);
    }
  }

  /**
    A DOMRect representing the place where this sprite will start the
    transition.
     ```js
    sprite.initialBounds;
    // { top: 0, bottom: 230, left: 0, right: 256, width: 256 }
    ```
     Not every sprite has initialBounds (a newly inserted
    sprite will not -- it will only have finalBounds).
     The position is measured *relative* to our offsetParent, if we
    have one. Most of the time we want motions to act in relative
    terms, so that if we're inside another animator things still work
    out correctly.
     You can manipulate initialBounds using methods like startAtPixel.
     Motions should look at initialBounds and finalBounds to decide
    what to do.
     @accessor initialBounds
    @type {DOMRect}
  */
  get initialBounds() {
    return this._initialBounds;
  }

  /**
    Like initialBounds, but relative to the screen, not the offset
    parent. Most of the time you *don't* want this one, because your
    motion will be more robust to ancestor motion if you do
    everything in relative terms.
     @accessor absoluteInitialBounds
    @type {DOMRect}
  */
  get absoluteInitialBounds() {
    if (this._offsetSprite) {
      return shiftedBounds(this._initialBounds, this._offsetSprite.initialBounds.left, this._offsetSprite.initialBounds.top);
    } else {
      return this._initialBounds;
    }
  }

  /**
    A DOMRect representing the place where this sprite will end the
    transition. Not every sprite has finalBounds (a sprite that is
    about to be destroyed will not -- it will only have
    initialBounds).
     The position is measured *relative* to our offsetParent, if we
    have one. Most of the time we want motions to act in relative
    terms, so that if we're inside another animator things still work
    out correctly.
     You can manipulate finalBounds using methods like endAtPixel.
    @accessor finalBounds
    @type {DOMRect}
  */
  get finalBounds() {
    return this._finalBounds;
  }

  /**
    Like initialBounds, but relative to the screen, not the offset
    parent. Most of the time you *don't* want this one, because your
    motion will be more robust to ancestor motion if you do
    everything in relative terms.
     @accessor absoluteFinalBounds
    @type {DOMRect}
  */
  get absoluteFinalBounds() {
    if (this._offsetSprite) {
      return shiftedBounds(this._finalBounds, this._offsetSprite.finalBounds.left, this._offsetSprite.finalBounds.top);
    } else {
      return this._finalBounds;
    }
  }

  /**
    A snapshot of the sprite's computed style at the start of the
    transition. We don't copy every possible property, see
    CopiedCSS.
     This is powered by getComputedStyle, so the property names and
    values will follow those semantics.
     Not every sprite will have an initialComputedStyle
    (`insertedSprites` do not).
     @accessor initialComputedStyle
    @type {CSSStyleDeclaration}
  */
  get initialComputedStyle() {
    return this._initialComputedStyle;
  }

  /**
    A snapshot of the sprite's computed style at the end of the
    transition. We don't copy every possible property, see
    CopiedCSS.
     This is powered by getComputedStyle, so the property names and
    values will follow those semantics.
     Not every sprite will have a finalComputedStyle
    (`removedSprites` do not).
     @accessor finalComputedStyle
    @type {CSSStyleDeclaration}
  */
  get finalComputedStyle() {
    return this._finalComputedStyle;
  }

  /**
    Returns the attribute value from the initial position object with the
    given `name`.
     _This is mostly intended for use with SVG, where you can say things
    like `getInitialDimension('x')`._
     @method getInitialDimension
    @param {string} name The desired attribute name.
    @return {number|string}
  */
  getInitialDimension(name) {
    return this._initialPosition[name];
  }

  /**
    Returns the attribute value from the final position object with the
    given `name`.
     _This is mostly intended for use with SVG, where you can say things
    like `getFinalDimension('x')`._
     @method getFinalDimension
    @param {string} name The desired attribute name.
    @return {number|string}
  */
  getFinalDimension(name) {
    return this._finalPosition[name];
  }

  /**
    Analogous to initialBounds, this is a snapshot of the cumulative
    effect of all transforms on this sprite at the start of
    animation.
     @method initialCumulativeTransform
    @return {Transform}
  */
  get initialCumulativeTransform() {
    return this._initialCumulativeTransform;
  }

  /**
    Analogous to finalBounds, this is a snapshot of the cumulative
    effect of all transforms on this sprite at the end of animation.
     @method finalCumulativeTransform
    @return {Transform}
  */
  get finalCumulativeTransform() {
    return this._finalCumulativeTransform;
  }

  /**
    Some things methods (like startAtSprite, startAtPixel, etc) can
    set or alter the initialBounds. This gives you access to the
    original value (which may be undefined if this sprite didn't have
    any initial bounds, which is the case for newly inserted
    sprites).
     @method originalInitialBounds
    @return {DOMRect}
  */
  get originalInitialBounds() {
    return this._originalInitialBounds;
  }

  /**
    Some things (like endAtSprite) can alter the finalBounds. This
    gives you access to the original value (which may be undefined if
    the sprite didn't have any final bounds, which is the case for
    removedSprites).
     @method originalFinalBounds
    @return {DOMRect}
  */
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

  /**
    Returns the current position of the element as an object.
     _This deliberately only tracks inline styles, because it's only
    important when the user is manipulating inline styles._
     @private
    @hide
    @method _getCurrentPosition
    @return {Object}
  */
  _getCurrentPosition() {
    let {
      element
    } = this;
    if (isSVG(element)) {
      let position = {
        x: getSVGLength(element, 'x'),
        y: getSVGLength(element, 'y'),
        cx: getSVGLength(element, 'cx'),
        cy: getSVGLength(element, 'cy'),
        r: getSVGLength(element, 'r'),
        width: getSVGLength(element, 'width'),
        height: getSVGLength(element, 'height'),
        transform: element.getAttribute('transform')
      };
      return position;
    } else {
      let style = this.element.style;
      let position = {
        top: style.top,
        left: style.left,
        bottom: style.bottom,
        right: style.right,
        transform: style.transform,
        classList: Array.from(this.element.classList)
      };
      return position;
    }
  }

  /**
    Sets the position of the element.
     @private
    @method _reapplyPosition
    @hide
    @param {Object} pos The position to apply.
    @return {void}
  */
  _reapplyPosition(pos) {
    if (!pos) {
      return;
    }
    if (isSVG(this.element)) {
      let {
        element
      } = this;
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
      let p = pos;
      style.top = p.top ?? '';
      style.left = p.left ?? '';
      style.right = p.right ?? '';
      style.bottom = p.bottom ?? '';
      style.transform = p.transform ?? '';
      for (let cls of p.classList) {
        this.element.classList.add(cls);
      }
      for (let cls of Array.from(this.element.classList)) {
        if (!p.classList.includes(cls)) {
          this.element.classList.remove(cls);
        }
      }
    }
  }
  measureInitialBounds() {
    if (this._initialBounds) {
      throw new Error('Sprite already has initial bounds');
    }
    this._inInitialPosition = true;
    if (this._offsetSprite) {
      this._initialBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.initialBounds);
    } else {
      this._initialBounds = this.element.getBoundingClientRect();
    }
    this._initialComputedStyle = copyComputedStyle(this.element);
    this._initialPosition = this._getCurrentPosition();
    this._originalInitialBounds = this._initialBounds;
    this._initialCumulativeTransform = cumulativeTransform(this.element);
  }
  assertHasInitialBounds() {
    if (!this._initialBounds) {
      throw new Error(`sprite does not have initialBounds`);
    }
  }
  assertHasOwner() {
    if (!this.owner) {
      throw new Error(`sprite does not have owner`);
    }
  }
  measureFinalBounds() {
    if (this._finalBounds) {
      throw new Error('Sprite already has final bounds');
    }
    this._inInitialPosition = false;
    if (this._offsetSprite) {
      this._finalBounds = relativeBounds(this.element.getBoundingClientRect(), this._offsetSprite.finalBounds);
    } else {
      this._finalBounds = this.element.getBoundingClientRect();
    }
    this._finalComputedStyle = copyComputedStyle(this.element);
    this._finalPosition = this._getCurrentPosition();
    this._originalFinalBounds = this._finalBounds;
    this._finalCumulativeTransform = cumulativeTransform(this.element);
  }
  assertHasFinalBounds() {
    if (!this._finalBounds) {
      throw new Error(`sprite does not have finalBounds`);
    }
  }

  /**
    Returns the difference between two sprites, represented as x and y
    coordinates.
     _`this.difference('initialBounds', other, 'finalBounds')` is
    interpreted as "the difference between this sprite's initial bounds
    and the other sprite's final bounds"._
     _It works this way because each sprite has its own local coordinate
    system._
     @method difference
    @param {string} which The current sprite's comparison attribute.
    @param {Sprite} otherSprite The other sprite.
    @param {string} otherWhich The other sprite's comparison attribute.
    @return {Object}
  */
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
  }
  get element() {
    return this.__element;
  }

  /**
    Returns the sprite's current transform, with appropriate caching
    so that you don't trigger reflows.
     @accessor transform
    @type {Transform}
  */
  get transform() {
    if (!this._transform) {
      this._transform = ownTransform(this.element);
    }
    return this._transform;
  }

  /**
    This is different from `this.transform` because it's the product
    of our own transform and all ancestor transforms. It's what you
    need if you want to understand how many real screen pixels there
    are to every local pixel in the sprite.
     @accessor cumulativeTransform
    @type {Object}
  */
  get cumulativeTransform() {
    if (!this._cumulativeTransform) {
      this._cumulativeTransform = cumulativeTransform(this.element);
    }
    return this._cumulativeTransform;
  }

  /**
    Returns wether the sprite is revealed or not.
     @accessor revealed
    @type {boolean}
  */
  get revealed() {
    if (this._revealed == null) {
      this._revealed = !this.__element.classList.contains('ember-animated-hidden');
    }
    return this._revealed;
  }
  _rememberSize() {
    // at the point in time when this runs, we always have either initial or
    // final measurements, but not both. So this will successfully pick the one
    // we do have, which applies to what we are currently measuring.
    let transform = this.initialCumulativeTransform || this.finalCumulativeTransform;
    let bounds = this.initialBounds || this.finalBounds;
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

    if (this.element.style.width === '') {
      this._imposedStyle['width'] = `${bounds.width / transform.a}px`;
      // TODO: do a more sophisticated size measurement so we don't
      // need to impose border-box. If we're only imposing width OR
      // height and we weren't originally in border box, we can get an
      // incorrect change in the non-imposed dimension.
      this._imposedStyle['box-sizing'] = 'border-box';
    }
    if (this.element.style.height === '') {
      this._imposedStyle['height'] = `${bounds.height / transform.d}px`;
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
    };
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
      this._imposedStyle['position'] = 'absolute';
    }
    if (style.top === '' && style.bottom === '') {
      // The user had no preexisting inline vertical positioning, so we take over.
      this._imposedStyle['top'] = `${offsets().top}px`;
      this._imposedStyle['margin-top'] = '0px';
    } else if (this._imposedStyle['position']) {
      // the user has inline styles for controlling vertical position,
      // but the element was not absolutely positioned, so we apply an
      // offseting transform.
      ty = offsets().top - parseFloat(computedStyle.top || '0');
    }
    if (style.left === '' && style.bottom === '') {
      // The user had no preexisting inline horizontal positioning, so we take over.
      this._imposedStyle['left'] = `${offsets().left}px`;
      this._imposedStyle['margin-left'] = `0px`;
    } else if (this._imposedStyle['position']) {
      // the user has inline styles for controlling vertical position,
      // but the element was not absolutely positioned, so we apply an
      // offseting transform.
      tx = offsets().left - parseFloat(computedStyle.left || '0');
    }
    if (tx || ty) {
      this._transform = this.transform.mult(new Transform(1, 0, 0, 1, tx, ty));
      this._imposedStyle['transform'] = this.transform.serialize();
    }
    this._collapsingChildren = collapsedChildren(this.element, computedStyle, 'top');
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
    warn(`Probable bug in ember-animated: an interrupted sprite tried to unlock itself.
       This is usually caused by a direct child of an animated component also being an
       animated component. To fix it, wrap the child in another DOM element.
       https://github.com/ember-animation/ember-animated/issues/178`, this.stillInFlight(), {
      id: 'ember-animated-sprite-unlock'
    });
    inFlight.delete(this.element);
    let cache = this._styleCache;
    Object.keys(cache).forEach(property => {
      setStyle(this.element, property, cache[property]);
    });

    // In case the user has caused our inline-style-driven position
    // to drift, we put it back.
    this._reapplyPosition(this._finalPosition);
    this._clearMarginCollapse();
  }

  /**
    This is your general purpose hook for changing CSS properties of
    the sprite's element. Use this when there's not a more specific
    method like `translate()`, `scale()`, `hide()`, or `reveal()`.
     ```js
    sprite.applyStyles({
      'opacity': '0',
      'z-index': '1'
    });
    ```
     Nothing you do to the sprite will persist after the transition is
    finished – we clean things up when it ends.
     @method applyStyles
    @param {Object} styles The styles to apply to the sprite.
    @return {void}
  */
  applyStyles(styles) {
    if (!this._lockMode) {
      throw new Error("can't apply styles to non-lockable sprite");
    }
    if (styles !== this._imposedStyle) {
      Object.keys(styles).forEach(property => {
        if (this._imposedStyle[property] == null) {
          this._styleCache[property] = this.element.style.getPropertyValue(property);
        }
        this._imposedStyle[property] = styles[property];
      });
    }
    Object.keys(styles).forEach(property => {
      let val = styles[property];
      if (typeof val !== 'string') {
        throw new Error(`Sprite#applyStyles only accepts string values. Convert any numeric values to strings (with appropriate units) before calling. You passed ${property}=${val}`);
      } else {
        setStyle(this.element, property, styles[property]);
      }
    });
  }
  stillInFlight() {
    return inFlight.get(this.element) === this;
  }

  /**
    Hides the sprite using CSS visibility property.
     @method hide
    @return {void}
  */
  hide() {
    this._revealed = false;
    this.__element.classList.add('ember-animated-hidden');
  }

  /**
    Reveals the sprite using CSS visibility property.
     _Newly inserted sprites start hidden, and are revealed when you
    start animating them. You can manually reveal them with this if
    you want them to appear right away and you're not animating them._
     @method reveal
    @return {void}
  */
  reveal() {
    if (!this.revealed) {
      this._revealed = true;
      this.__element.classList.remove('ember-animated-hidden');
    }
  }

  /**
    Manages the application of the `ember-animated-none` CSS class on
    the element.
     When the flag is truthy, the class is removed and the element is
    therefore visible.
     When the flag is falsy, the class is applied and the element is
    therefore hidden.
     @method display
    @param {boolean} flag
    @return {void}
  */
  display(flag) {
    if (flag) {
      this.__element.classList.remove('ember-animated-none');
    } else {
      this.__element.classList.add('ember-animated-none');
    }
  }

  /**
    Translates the sprite by the given number of screen pixels.
     _Disregards any pre-existing transforms._
     @method translate
    @param {number} dx The number of screen pixels on the x axis.
    @param {number} dy The number of screen pixels on the y axis.
    @return {void}
  */
  translate(dx, dy) {
    let t = this.transform;
    t = t.mult(new Transform(1, 0, 0, 1, dx / t.a, dy / t.d));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize(),
      'transform-origin': '0 0'
    });
  }

  /**
    Adjusts the sprite's scale by the given scaling factors.
     @method scale
    @param {number} scaleX The scaling factor to apply to the x axis.
    @param {number} scaleY The scaling factor to apply to the y axis.
    @return {void}
  */
  scale(scaleX, scaleY) {
    let t = this.transform.mult(new Transform(scaleX, 0, 0, scaleY, 0, 0));
    this._transform = t;
    this.applyStyles({
      transform: t.serialize(),
      'transform-origin': '0 0'
    });
  }

  /**
    Adjusts the sprite so it will still be in the same visual position
    despite being moved into a new offset parent.
     @method rehome
    @param {Sprite} newOffsetSprite
    @return {void}
  */
  rehome(newOffsetSprite) {
    let screenBounds = this.absoluteInitialBounds;
    let newRelativeBounds = shiftedBounds(screenBounds, -newOffsetSprite.initialBounds.left, -newOffsetSprite.initialBounds.top);
    let initialAmbientTransform = this._offsetSprite.cumulativeTransform;
    let finalAmbientTransform = newOffsetSprite.cumulativeTransform;
    let t = this.transform;
    t = t.mult(new Transform(initialAmbientTransform.a / finalAmbientTransform.a, 0, 0, initialAmbientTransform.d / finalAmbientTransform.d, (newRelativeBounds.left - t.tx) / t.a, (newRelativeBounds.top - t.ty) / t.d));
    this._transform = t;
    this._imposedStyle['transform'] = t.serialize();
    this._imposedStyle['transform-origin'] = '0 0';
    this._imposedStyle['top'] = `0px`;
    this._imposedStyle['left'] = `0px`;
    this._offsetSprite = newOffsetSprite;
    this._initialBounds = newRelativeBounds;
    this._inInitialPosition = true;
  }
  _handleMarginCollapse() {
    if (this._collapsingChildren) {
      const children = this._collapsingChildren;
      for (const child of children) {
        child.classList.add('ember-animated-top-collapse');
      }
    }
  }
  _clearMarginCollapse() {
    if (this._collapsingChildren) {
      const children = this._collapsingChildren;
      for (const child of children) {
        child.classList.remove('ember-animated-top-collapse');
      }
    }
  }

  /**
    Sets the sprite's `initialBounds` relative to the provided `otherSprite`.
     @method startAtSprite
    @param {Sprite} otherSprite
    @return {void}
  */
  startAtSprite(otherSprite) {
    continueMotions(otherSprite.element, this.element);
    let diff = this.difference('finalBounds', otherSprite, 'initialBounds');
    this.startTranslatedBy(-diff.dx, -diff.dy);
    this._initialBounds = resizedBounds(this._initialBounds, otherSprite.initialBounds.width, otherSprite.initialBounds.height);
    this._initialComputedStyle = otherSprite.initialComputedStyle;
    this._initialCumulativeTransform = otherSprite.initialCumulativeTransform;
  }

  /**
    Sets the sprite's `initialBounds` using the provided
    x and y coordinates.
     ```js
    sprite.startAtPixel({ x: 0, y: 0 });
    ```
     @method startAtPixel
    @param {Object} point The x and y coordinates.
    @return {void}
  */
  startAtPixel({
    x,
    y
  }) {
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

  /**
    Sets the sprite's `initialBounds` relative to its `finalBounds`.
     @method startTranslatedBy
    @param {number} dx
    @param {number} dy
    @return {void}
  */
  startTranslatedBy(dx, dy) {
    let priorInitialBounds = this._initialBounds;
    let offsetX = 0;
    let offsetY = 0;
    if (this._offsetSprite) {
      offsetX = this._offsetSprite.finalBounds.left - this._offsetSprite.initialBounds.left;
      offsetY = this._offsetSprite.finalBounds.top - this._offsetSprite.initialBounds.top;
    }
    this._initialBounds = shiftedBounds(this._finalBounds, dx - offsetX, dy - offsetY);
    if (this._inInitialPosition) {
      // we were already moved into our priorInitiaBounds position, so we need to compensate
      this.translate(this._initialBounds.left - priorInitialBounds.left, this._initialBounds.top - priorInitialBounds.top);
    } else {
      this.translate(this._initialBounds.left - this._finalBounds.left, this._initialBounds.top - this._finalBounds.top);
      this._inInitialPosition = true;
    }
  }

  /**
    Moves the sprite to its final position (`finalBounds`).
     @method moveToFinalPosition
    @return {void}
  */
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

  /**
    Sets the sprite's `finalBounds` using the provided `otherSprite`.
     @method endAtSprite
    @param {Sprite} otherSprite
    @return {void}
  */
  endAtSprite(otherSprite) {
    let diff = otherSprite.difference('finalBounds', this, 'initialBounds');
    this.endTranslatedBy(diff.dx, diff.dy);
    this._finalBounds = resizedBounds(this._finalBounds, otherSprite.finalBounds.width, otherSprite.finalBounds.height);
    this._finalComputedStyle = otherSprite.finalComputedStyle;
    this._finalCumulativeTransform = otherSprite.finalCumulativeTransform;
  }

  /**
    Sets the sprite's `finalBounds` using the provided point `{ x, y }`.
     ```js
    sprite.endAtPixel({ x: window.innerWidth });
    ```
     @method endAtPixel
    @param {Object} point The x and y coordinates.
    @return {void}
  */
  endAtPixel({
    x,
    y
  }) {
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

  /**
    Sets the sprite's `finalBounds` using its `initialBounds` and
    the provided x and y axis offset.
     @method endTranslatedBy
    @param {number} dx The x axis offset.
    @param {number} dy The y axis offset.
    @return {void}
  */
  endTranslatedBy(dx, dy) {
    this._finalBounds = shiftedBounds(this._initialBounds, dx, dy);
  }

  /**
    Sets this sprite's `finalBounds` so that its position relative
    to the `otherSprite` remains constant through the transition.
     @method endRelativeTo
    @param {Sprite} otherSprite Note: must have initial and final bounds
    @return {void}
  */
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
      left -= eopBounds.left + parseFloat(eopComputedStyle.borderLeftWidth || '0');
      top -= eopBounds.top + parseFloat(eopComputedStyle.borderTopWidth || '0');
      let eopTransform = cumulativeTransform(effectiveOffsetParent);
      left /= eopTransform.a;
      top /= eopTransform.d;
    }
  }
  left -= transform.tx;
  top -= transform.ty;
  return {
    top,
    left
  };
}
const SVGNamespace = 'http://www.w3.org/2000/svg';

// We have special handling for SVG elements inside SVG documents. An
// <svg> tag itself whose parent is not SVG doesn't need special
// handling -- it participates in normal HTML positioning.
function isSVG(element) {
  return element.namespaceURI === SVGNamespace && (element.parentElement || false) && element.parentElement.namespaceURI === SVGNamespace;
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
    let styles = window.getComputedStyle(cursor);
    let t = styles.transform !== '' ? styles.transform : cursor.style.transform;
    if (t !== 'none') {
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
  return null;
}
function setSVGLength(element, property, values) {
  if (typeof values[property] === 'number') {
    element[property].baseVal.value = values[property];
  }
}
function setAttribute(element, attrName, values) {
  let value = values[attrName];
  if (value) {
    element.setAttribute(attrName, value);
  } else {
    element.removeAttribute(attrName);
  }
}
function setStyle(element, property, value) {
  if (/[A-Z]/.test(property)) {
    throw new Error(`applyStyles expects all CSS property names to be formatted as in CSS. Not camelcased. You passed ${property}.`);
  }
  element.style.setProperty(property, value);
}

// getComputedStyle returns a *live* CSSStyleDeclaration that will
// keep changing as the element changes. So we use this to copy off a
// snapshot of the properties we potentially care about.
function copyComputedStyle(element) {
  let computed = getComputedStyle(element);
  let output = new CopiedCSS();
  for (let property of COPIED_CSS_PROPERTIES) {
    output[property] = computed.getPropertyValue(property);
  }
  return output;
}
class CopiedCSS {
  'opacity';
  'font-size';
  'font-family';
  'font-weight';
  'color';
  'background-color';
  'border-color';
  'letter-spacing';
  'line-height';
  'text-align';
  'text-transform';
  'padding';
  'padding-top';
  'padding-bottom';
  'padding-left';
  'padding-right';
  'border-radius';
  'border-top-left-radius';
  'border-top-right-radius';
  'border-bottom-left-radius';
  'border-bottom-right-radius';
  'box-shadow';
}
const COPIED_CSS_PROPERTIES = ['opacity', 'font-size', 'font-family', 'font-weight', 'color', 'background-color', 'border-color', 'letter-spacing', 'line-height', 'text-align', 'text-transform', 'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'box-shadow'];

// This strange construct allows access of the alternative type's keys returning undefined values.
// This significantly simplifies our typing efforts.

export { CopiedCSS, Sprite as default };
//# sourceMappingURL=sprite.js.map
