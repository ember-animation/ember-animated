import ComputedProperty, { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { Resize } from '../motions/resize';
import { task, Task } from '../-private/ember-scheduler';
import Sprite from '../-private/sprite';
import { afterRender, microwait } from '..';
import { componentNodes } from '../-private/ember-internals';
import layout from 'ember-animated/templates/components/animated-container';
import MotionService from 'ember-animated/services/motion';
import { action } from '@ember/object';
import { MotionConstructor } from '../-private/motion';

/**
 Provides a boundary between animator components and the surrounding document
 which smoothly resizes as animators change. Use animated-container whenever you
 need to "hold a place for" some animated content while that content is animating.
  ```hbs
  <button {{action toggleThing}}>Toggle</button>
  <AnimatedContainer>
    {{#animated-if showThing use=transition }}
        <div class="message" {{action "toggleThing"}}>
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
  import move from 'ember-animated/motions/move';
  import {easeOut, easeIn } from 'ember-animated/easings/cosine';

  export default Component.extend({
    showThing: false,

    toggleThing() {
      this.set('showThing', !this.get('showThing'));
    },

    transition: function * ({ insertedSprites, keptSprites, removedSprites }) {
      for (let sprite of insertedSprites) {
        sprite.startAtPixel({ x: window.innerWidth });
        move(sprite, { easing: easeOut });
      }

      for (let sprite of keptSprites) {
        move(sprite);
      }

      for (let sprite of removedSprites) {
        sprite.endAtPixel({ x: window.innerWidth });
        move(sprite, { easing: easeIn });
      }
    },
  });
  ```
  @class animated-container
  @public
*/
export default class AnimatedContainerComponent extends Component {
  layout = layout;
  tagName = '';

  @service('-ea-motion')
  motionService!: MotionService;

  /**
   * Use a custom tag for the container. Defaults to div.
    @argument tag
    @type String
  */
  tag = 'div';

  /**
   * Whether to animate the initial render. You will probably also need to set
   * initialInsertion=true on a child component of animated-container.
   * Defaults to false.
    @argument onInitialRender
    @type Boolean
  */
  onInitialRender = false;

  /**
   * Use a custom tag for the container. Defaults to div.
    @argument motion
    @type String
  */
  motion: MotionConstructor = Resize;

  private _inserted = false;
  private _startingUp = false;
  private sprite: Sprite | null = null;

  constructor(properties: object | undefined) {
    super(properties);
    this.get('motionService')
      .register(this)
      .observeDescendantAnimations(this as any, this.maybeAnimate); // TODO: shouldn't need this cast;
  }

  didInsertElement() {
    this._inserted = true;
  }

  private _ownElement() {
    if (!this._inserted) {
      return undefined;
    }
    let { firstNode, lastNode } = componentNodes(this);
    let node: Node | null = firstNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node as Element;
      }
      if (node === lastNode) {
        break;
      }
      node = node.nextSibling;
    }
    return undefined;
  }

  willDestroyElement() {
    this.get('motionService')
      .unregister(this)
      .unobserveDescendantAnimations(this as any, this.maybeAnimate); // TODO: shouldn't need this cast
  }

  @alias('animated.isRunning')
  isAnimating!: boolean;

  @action
  maybeAnimate({ duration, task }: { duration: number; task: Promise<void> }) {
    if (!this._startingUp) {
      this.get('animate').perform(duration, task);
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

  @(task(function*(
    this: AnimatedContainerComponent,
    duration: number,
    animationTask: Promise<void>,
  ) {
    this._startingUp = true;
    let service = this.get('motionService');
    let sprite: Sprite;
    let useMotion;
    let element = this._ownElement();

    if (element) {
      sprite = Sprite.sizedStartingAt(element);
      this.sprite = sprite;
      sprite.lock();
      useMotion = true;
    } else {
      useMotion = this.get('onInitialRender');
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
        sprite = Sprite.sizedEndingAt(this._ownElement()!);
        this.sprite = sprite;
      } else {
        sprite.measureFinalBounds();
      }
    });

    if (useMotion) {
      yield* new this.motion(this.sprite!, { duration })._run();
    }

    yield animationTask;

    this.sprite!.unlock();
    this.sprite = null;
  }).restartable())
  animate!: ComputedProperty<Task>;
}
