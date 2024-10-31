import { _ as _applyDecoratedDescriptor, a as _defineProperty, b as _initializerDefineProperty } from '../_rollupPluginBabelHelpers-iYhWj1qN.js';
import { inject } from '@ember/service';
import Component, { setComponentTemplate } from '@ember/component';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import { dependencySatisfies } from '@embroider/macros';
import { Resize } from '../motions/resize.js';
import { task } from '../-private/ember-scheduler.js';
import Sprite from '../-private/sprite.js';
import { afterRender, microwait } from '../-private/concurrency-helpers.js';
import { componentNodes } from '../-private/ember-internals.js';
import { precompileTemplate } from '@ember/template-compilation';

var TEMPLATE = precompileTemplate("{{#if this.useElementHelper}}\n  {{!--\n    The @class is only there to support a deprecated usage.\n  --}}\n  {{#let (element this.tag) as |Tag|~}}\n    {{! @glint-ignore: https://github.com/typed-ember/glint/issues/610 }}\n    <Tag class=\"animated-container {{@class}}\" ...attributes>\n      {{yield}}\n    </Tag>\n  {{/let}}\n{{else}}\n  {{!--\n    The @class is only there to support a deprecated usage.\n  --}}\n  {{! @glint-ignore }}\n  {{#let (component (ensure-safe-component (-element this.tag)) tagName=this.tag) as |Tag|~}}\n    {{! @glint-ignore }}\n    <Tag class=\"animated-container {{@class}}\" ...attributes>\n      {{yield}}\n    </Tag>\n  {{/let}}\n{{/if}}");

var _dec, _dec2, _dec3, _class, _descriptor, _descriptor2, _descriptor3;
/**
 Provides a boundary between animator components and the surrounding document
 which smoothly resizes as animators change. Use animated-container whenever you
 need to "hold a place for" some animated content while that content is animating.
  ```hbs
  <button {{on "click" this.toggleThing}}>Toggle</button>
  <AnimatedContainer>
    {{#animated-if this.showThing use=this.transition }}
        <div class="message" {{on "click" this.toggleThing}}>
            Hello!
        </div>
    {{/animated-if}}
  </AnimatedContainer>
  <p>
    This is outside of the container.
  </p>
  ```
  ```js
  import Component from '@ember/component';
  import { action } from '@ember/object';
  import { tracked } from '@glimmer/tracking';
  import move from 'ember-animated/motions/move';
  import { easeOut, easeIn } from 'ember-animated/easings/cosine';

  export default class AnimatedContainerComponentExample extends Component {
    @tracked showThing = false;

    @action
    toggleThing() {
      this.showThing = !this.showThing;
    }

    *transition({ insertedSprites, keptSprites, removedSprites }) {
      for (let sprite of insertedSprites) {
        sprite.startAtPixel({ x: window.innerWidth });
        yield move(sprite, { easing: easeOut });
      }

      for (let sprite of keptSprites) {
        yield move(sprite);
      }

      for (let sprite of removedSprites) {
        sprite.endAtPixel({ x: window.innerWidth });
        yield move(sprite, { easing: easeIn });
      }
    }
  }
  ```
  @class animated-container
  @public
*/
let AnimatedContainerComponent = (_dec = inject('-ea-motion'), _dec2 = alias('animated.isRunning'), _dec3 = task(function* (duration, animationTask) {
  this._startingUp = true;
  let service = this.motionService;
  let sprite;
  let useMotion;
  let element = this._ownElement();
  if (element) {
    sprite = Sprite.sizedStartingAt(element);
    this.sprite = sprite;
    sprite.lock();
    useMotion = true;
  } else {
    useMotion = this.onInitialRender;
  }
  try {
    yield afterRender();
    yield microwait();
  } finally {
    this._startingUp = false;
  }
  yield* service.staticMeasurement(() => {
    if (!sprite) {
      // ownElement is non-null here because we waited for render above, and
      // our own template definitely contains an Element
      sprite = Sprite.sizedEndingAt(this._ownElement());
      this.sprite = sprite;
    } else {
      sprite.measureFinalBounds();
    }
  });
  if (useMotion) {
    yield* new this.motion(this.sprite, {
      duration
    })._run();
  }
  yield animationTask;
  this.sprite.unlock();
  this.sprite = null;
}).restartable(), (_class = class AnimatedContainerComponent extends Component {
  constructor(properties) {
    super(properties);
    _defineProperty(this, "tagName", '');
    _initializerDefineProperty(this, "motionService", _descriptor, this);
    /**
     * Use a custom tag for the container. Defaults to div.
      @argument tag
      @type String
    */
    _defineProperty(this, "tag", 'div');
    // @todo https://github.com/typed-ember/glint/issues/610
    // tag: Tag = 'div' as Tag;
    /**
     * Whether to animate the initial render. You will probably also need to set
     * initialInsertion=true on a child component of animated-container.
     * Defaults to false.
      @argument onInitialRender
      @type Boolean
    */
    _defineProperty(this, "onInitialRender", false);
    /**
     * Use a custom tag for the container. Defaults to div.
      @argument motion
      @type String
    */
    _defineProperty(this, "motion", Resize);
    _defineProperty(this, "_inserted", false);
    _defineProperty(this, "_startingUp", false);
    _defineProperty(this, "sprite", null);
    _initializerDefineProperty(this, "isAnimating", _descriptor2, this);
    _initializerDefineProperty(this, "animate", _descriptor3, this);
    this.motionService.register(this).observeDescendantAnimations(this, this.maybeAnimate); // TODO: shouldn't need this cast;
  }

  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
  }
  _ownElement() {
    if (!this._inserted) {
      return undefined;
    }
    let {
      firstNode,
      lastNode
    } = componentNodes(this);
    let node = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node;
      }
      if (node === lastNode) {
        break;
      }
      node = node.nextSibling;
    }
    return undefined;
  }
  willDestroyElement() {
    super.willDestroyElement();
    this.motionService.unregister(this).unobserveDescendantAnimations(this, this.maybeAnimate); // TODO: shouldn't need this cast
  }

  maybeAnimate({
    duration,
    task
  }) {
    if (!this._startingUp) {
      this.animate.perform(duration, task);
    }
  }
  beginStaticMeasurement() {
    if (this.sprite) {
      this.sprite.unlock();
    }
  }
  endStaticMeasurement() {
    if (this.sprite) {
      this.sprite.lock();
    }
  }
  get useElementHelper() {
    return dependencySatisfies('ember-element-helper', '>=0.6.1');
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "motionService", [_dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "isAnimating", [_dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class.prototype, "maybeAnimate", [action], Object.getOwnPropertyDescriptor(_class.prototype, "maybeAnimate"), _class.prototype), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "animate", [_dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class));
setComponentTemplate(TEMPLATE, AnimatedContainerComponent);

export { AnimatedContainerComponent as default };
//# sourceMappingURL=animated-container.js.map
