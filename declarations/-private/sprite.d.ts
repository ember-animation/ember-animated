import Transform from './transform.ts';
import type Child from './child.ts';
/**
  A Sprite is our handle to a DOM element that we want to animate.

  It manages locking and unlocking the element (which means taking it
  in and out of static document flow so it's readily animatable).

  It tracks the sprite's current transform.

  It tracks the sprite's initial and/or final bounds, as measured
  from the actual pre- and/or post-animation DOM.

  @class Sprite
*/
export default class Sprite {
    static offsetParentStartingAt(element: Element): Sprite;
    static offsetParentEndingAt(element: Element): Sprite;
    static positionedStartingAt(element: Element, offsetSprite: Sprite): Sprite;
    static positionedEndingAt(element: Element, offsetSprite: Sprite): Sprite;
    static sizedStartingAt(element: Element): Sprite;
    static sizedEndingAt(element: Element): Sprite;
    private __element;
    owner: Child | null;
    private _transform;
    private _cumulativeTransform;
    private _offsetSprite;
    private _lockedToInitialPosition;
    private _finalComputedStyle;
    private _finalBounds;
    private _originalFinalBounds;
    private _finalPosition;
    private _finalCumulativeTransform;
    private _initialComputedStyle;
    private _initialBounds;
    private _originalInitialBounds;
    private _initialPosition;
    private _initialCumulativeTransform;
    private _revealed;
    private _imposedStyle;
    private _styleCache;
    private _collapsingChildren;
    private _lockMode;
    private _inInitialPosition;
    constructor(element: Element, inInitialPosition: boolean, lockMode: 'position' | 'size' | null, offsetSprite: Sprite | null);
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
    get initialBounds(): DOMRect | null;
    /**
      Like initialBounds, but relative to the screen, not the offset
      parent. Most of the time you *don't* want this one, because your
      motion will be more robust to ancestor motion if you do
      everything in relative terms.
  
      @accessor absoluteInitialBounds
      @type {DOMRect}
    */
    get absoluteInitialBounds(): DOMRect;
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
    get finalBounds(): DOMRect | null;
    /**
      Like initialBounds, but relative to the screen, not the offset
      parent. Most of the time you *don't* want this one, because your
      motion will be more robust to ancestor motion if you do
      everything in relative terms.
  
      @accessor absoluteFinalBounds
      @type {DOMRect}
    */
    get absoluteFinalBounds(): DOMRect | null;
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
    get initialComputedStyle(): CopiedCSS | null;
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
    get finalComputedStyle(): CopiedCSS | null;
    /**
      Returns the attribute value from the initial position object with the
      given `name`.
  
      _This is mostly intended for use with SVG, where you can say things
      like `getInitialDimension('x')`._
  
      @method getInitialDimension
      @param {string} name The desired attribute name.
      @return {number|string}
    */
    getInitialDimension<K extends keyof SpritePosition>(name: K): SpritePosition[K];
    /**
      Returns the attribute value from the final position object with the
      given `name`.
  
      _This is mostly intended for use with SVG, where you can say things
      like `getFinalDimension('x')`._
  
      @method getFinalDimension
      @param {string} name The desired attribute name.
      @return {number|string}
    */
    getFinalDimension<K extends keyof SpritePosition>(name: K): SpritePosition[K];
    /**
      Analogous to initialBounds, this is a snapshot of the cumulative
      effect of all transforms on this sprite at the start of
      animation.
  
      @method initialCumulativeTransform
      @return {Transform}
    */
    get initialCumulativeTransform(): Transform | null;
    /**
      Analogous to finalBounds, this is a snapshot of the cumulative
      effect of all transforms on this sprite at the end of animation.
  
      @method finalCumulativeTransform
      @return {Transform}
    */
    get finalCumulativeTransform(): Transform | null;
    /**
      Some things methods (like startAtSprite, startAtPixel, etc) can
      set or alter the initialBounds. This gives you access to the
      original value (which may be undefined if this sprite didn't have
      any initial bounds, which is the case for newly inserted
      sprites).
  
      @method originalInitialBounds
      @return {DOMRect}
    */
    get originalInitialBounds(): DOMRect | null;
    /**
      Some things (like endAtSprite) can alter the finalBounds. This
      gives you access to the original value (which may be undefined if
      the sprite didn't have any final bounds, which is the case for
      removedSprites).
  
      @method originalFinalBounds
      @return {DOMRect}
    */
    get originalFinalBounds(): DOMRect | null;
    getCurrentBounds(): DOMRect | undefined;
    /**
      Returns the current position of the element as an object.
  
      _This deliberately only tracks inline styles, because it's only
      important when the user is manipulating inline styles._
  
      @private
      @hide
      @method _getCurrentPosition
      @return {Object}
    */
    _getCurrentPosition(): SpritePosition;
    /**
      Sets the position of the element.
  
      @private
      @method _reapplyPosition
      @hide
      @param {Object} pos The position to apply.
      @return {void}
    */
    _reapplyPosition(pos: SpritePosition): void;
    measureInitialBounds(): void;
    assertHasInitialBounds(): asserts this is SpriteWithInitialBounds;
    assertHasOwner(): asserts this is SpriteWithOwner;
    measureFinalBounds(): void;
    assertHasFinalBounds(): asserts this is SpriteWithFinalBounds;
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
    difference(which: 'initialBounds' | 'finalBounds', otherSprite: Sprite, otherWhich: 'initialBounds' | 'finalBounds'): {
        dx: number;
        dy: number;
    };
    set element(value: Element);
    get element(): Element;
    /**
      Returns the sprite's current transform, with appropriate caching
      so that you don't trigger reflows.
  
      @accessor transform
      @type {Transform}
    */
    get transform(): Transform;
    /**
      This is different from `this.transform` because it's the product
      of our own transform and all ancestor transforms. It's what you
      need if you want to understand how many real screen pixels there
      are to every local pixel in the sprite.
  
      @accessor cumulativeTransform
      @type {Object}
    */
    get cumulativeTransform(): Transform;
    /**
      Returns wether the sprite is revealed or not.
  
      @accessor revealed
      @type {boolean}
    */
    get revealed(): unknown;
    _rememberSize(): void;
    _lazyOffsets(computedStyle: CSSStyleDeclaration): () => {
        top: number;
        left: number;
    };
    _rememberPosition(): void;
    _cacheOriginalStyles(): void;
    lock(): void;
    unlock(): void;
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
    applyStyles<T extends {
        [P in keyof T]: string;
    }>(styles: T): void;
    stillInFlight(): boolean;
    /**
      Hides the sprite using CSS visibility property.
  
      @method hide
      @return {void}
    */
    hide(): void;
    /**
      Reveals the sprite using CSS visibility property.
  
      _Newly inserted sprites start hidden, and are revealed when you
      start animating them. You can manually reveal them with this if
      you want them to appear right away and you're not animating them._
  
      @method reveal
      @return {void}
    */
    reveal(): void;
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
    display(flag: boolean): void;
    /**
      Translates the sprite by the given number of screen pixels.
  
      _Disregards any pre-existing transforms._
  
      @method translate
      @param {number} dx The number of screen pixels on the x axis.
      @param {number} dy The number of screen pixels on the y axis.
      @return {void}
    */
    translate(dx: number, dy: number): void;
    /**
      Adjusts the sprite's scale by the given scaling factors.
  
      @method scale
      @param {number} scaleX The scaling factor to apply to the x axis.
      @param {number} scaleY The scaling factor to apply to the y axis.
      @return {void}
    */
    scale(scaleX: number, scaleY: number): void;
    /**
      Adjusts the sprite so it will still be in the same visual position
      despite being moved into a new offset parent.
  
      @method rehome
      @param {Sprite} newOffsetSprite
      @return {void}
    */
    rehome(newOffsetSprite: Sprite): void;
    _handleMarginCollapse(): void;
    _clearMarginCollapse(): void;
    /**
      Sets the sprite's `initialBounds` relative to the provided `otherSprite`.
  
      @method startAtSprite
      @param {Sprite} otherSprite
      @return {void}
    */
    startAtSprite(otherSprite: Sprite): void;
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
    startAtPixel({ x, y }: {
        x?: number;
        y?: number;
    }): void;
    /**
      Sets the sprite's `initialBounds` relative to its `finalBounds`.
  
      @method startTranslatedBy
      @param {number} dx
      @param {number} dy
      @return {void}
    */
    startTranslatedBy(dx: number, dy: number): void;
    /**
      Moves the sprite to its final position (`finalBounds`).
  
      @method moveToFinalPosition
      @return {void}
    */
    moveToFinalPosition(): void;
    /**
      Sets the sprite's `finalBounds` using the provided `otherSprite`.
  
      @method endAtSprite
      @param {Sprite} otherSprite
      @return {void}
    */
    endAtSprite(otherSprite: Sprite): void;
    /**
      Sets the sprite's `finalBounds` using the provided point `{ x, y }`.
  
      ```js
      sprite.endAtPixel({ x: window.innerWidth });
      ```
  
      @method endAtPixel
      @param {Object} point The x and y coordinates.
      @return {void}
    */
    endAtPixel({ x, y }: {
        x?: number;
        y?: number;
    }): void;
    /**
      Sets the sprite's `finalBounds` using its `initialBounds` and
      the provided x and y axis offset.
  
      @method endTranslatedBy
      @param {number} dx The x axis offset.
      @param {number} dy The y axis offset.
      @return {void}
    */
    endTranslatedBy(dx: number, dy: number): void;
    /**
      Sets this sprite's `finalBounds` so that its position relative
      to the `otherSprite` remains constant through the transition.
  
      @method endRelativeTo
      @param {Sprite} otherSprite Note: must have initial and final bounds
      @return {void}
    */
    endRelativeTo(otherSprite: Sprite): void;
}
export declare class CopiedCSS {
    'opacity': string;
    'font-size': string;
    'font-family': string;
    'font-weight': string;
    'color': string;
    'background-color': string;
    'border-color': string;
    'letter-spacing': string;
    'line-height': string;
    'text-align': string;
    'text-transform': string;
    'padding': string;
    'padding-top': string;
    'padding-bottom': string;
    'padding-left': string;
    'padding-right': string;
    'border-radius': string;
    'border-top-left-radius': string;
    'border-top-right-radius': string;
    'border-bottom-left-radius': string;
    'border-bottom-right-radius': string;
    'box-shadow': string;
}
export interface SVGPosition {
    x: number | null;
    y: number | null;
    cx: number | null;
    cy: number | null;
    r: number | null;
    width: number | null;
    height: number | null;
    transform: string | null;
}
interface HTMLPosition {
    top: string | null;
    left: string | null;
    bottom: string | null;
    right: string | null;
    transform: string;
    classList: string[];
}
export type SpritePosition = (HTMLPosition & Partial<Record<Exclude<keyof SVGPosition, keyof HTMLPosition>, undefined>>) | (SVGPosition & Partial<Record<Exclude<keyof HTMLPosition, keyof SVGPosition>, undefined>>);
export interface SpriteWithInitialBounds extends Sprite {
    initialBounds: DOMRect;
    initialComputedStyle: CopiedCSS;
    initialPosition: DOMRect;
    originalInitialBounds: DOMRect;
    initialCumulativeTransform: Transform;
}
export interface SpriteWithFinalBounds extends Sprite {
    finalBounds: DOMRect;
    finalComputedStyle: CopiedCSS;
    finalPosition: DOMRect;
    originalFinalBounds: DOMRect;
    finalCumulativeTransform: Transform;
}
export interface SpriteWithOwner extends Sprite {
    owner: Child;
}
export {};
//# sourceMappingURL=sprite.d.ts.map