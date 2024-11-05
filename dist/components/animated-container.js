import { inject } from '@ember/service';
import Component, { setComponentTemplate } from '@ember/component';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import { Resize } from '../motions/resize.js';
import { task } from '../-private/ember-scheduler.js';
import Sprite from '../-private/sprite.js';
import { afterRender, microwait } from '../-private/concurrency-helpers.js';
import { componentNodes } from '../-private/ember-internals.js';
import { precompileTemplate } from '@ember/template-compilation';
import { g, i, n } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{!--\n  The @class is only there to support a deprecated usage.\n--}}\n{{#let (element this.tag) as |Tag|~}}\n  {{! @glint-ignore: https://github.com/typed-ember/glint/issues/610 }}\n  <Tag class=\"animated-container {{@class}}\" ...attributes>\n    {{yield}}\n  </Tag>\n{{/let}}");

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
class AnimatedContainerComponent extends Component {
  tagName = '';
  static {
    g(this.prototype, "motionService", [inject('-ea-motion')]);
  }
  #motionService = (i(this, "motionService"), void 0);
  /**
   * Use a custom tag for the container. Defaults to div.
    @argument tag
    @type String
  */
  tag = 'div';
  // @todo https://github.com/typed-ember/glint/issues/610
  // tag: Tag = 'div' as Tag;

  /**
   * Whether to animate the initial render. You will probably also need to set
   * initialInsertion=true on a child component of animated-container.
   * Defaults to false.
    @argument onInitialRender
    @type Boolean
  */
  onInitialRender = false;

  /**
   * Use a custom motion to resize the container. Defaults to `Resize`.
    @argument motion
    @type String
  */
  motion = Resize;
  _inserted = false;
  _startingUp = false;
  sprite = null;
  constructor(properties) {
    super(properties);
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
  static {
    g(this.prototype, "isAnimating", [alias('animated.isRunning')]);
  }
  #isAnimating = (i(this, "isAnimating"), void 0);
  maybeAnimate({
    duration,
    task
  }) {
    if (!this._startingUp) {
      this.animate.perform(duration, task);
    }
  }
  static {
    n(this.prototype, "maybeAnimate", [action]);
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
  static {
    g(this.prototype, "animate", [task(function* (duration, animationTask) {
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
    }).restartable()]);
  }
  #animate = (i(this, "animate"), void 0);
}
setComponentTemplate(TEMPLATE, AnimatedContainerComponent);

export { AnimatedContainerComponent as default };
//# sourceMappingURL=animated-container.js.map
