import * as emberService from '@ember/service';
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';
import { Resize } from '../motions/resize.ts';
import { task, type Task } from '../-private/ember-scheduler.ts';
import Sprite from '../-private/sprite.ts';
import { afterRender, microwait } from '../-private/concurrency-helpers.ts';
import { componentNodes } from '../-private/ember-internals.ts';
import type MotionService from '../services/-ea-motion.ts';
import type { MotionConstructor } from '../-private/motion.ts';
import type Owner from '@ember/owner';
import { element } from 'ember-element-helper';
const service = emberService.service ?? emberService.inject;

interface AnimatedContainerSignature<Tag extends string> {
  /** Multiple tags supported for base element via `tag` arg */
  // Element: ElementFromTagName<Tag>; // @todo https://github.com/typed-ember/glint/issues/610
  Element: HTMLDivElement;
  Args: {
    motion?: string;

    /** Whether to animate the initial render. You will probably also need to set initialInsertion=true on a child component of animated-container. Defaults to false. */
    onInitialRender?: boolean;

    /** Use a custom tag for the container. Defaults to div. */
    tag?: Tag;
    class?: string;
  };
  Blocks: {
    default: [];
  };
}

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
export default class AnimatedContainerComponent<
  Tag extends string = 'div',
> extends Component<AnimatedContainerSignature<Tag>> {
  tagName = '';

  @service('-ea-motion')
  motionService!: MotionService;

  /**
   * Use a custom tag for the container. Defaults to div.
    @argument tag
    @type String
  */
  tag = 'div' as const;
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
  motion: MotionConstructor = Resize;

  private _inserted = false;
  private _startingUp = false;
  private sprite: Sprite | null = null;

  constructor(properties: Owner | undefined) {
    super(properties);
    this.motionService
      .register(this as any)
      .observeDescendantAnimations(this as any, this.maybeAnimate); // TODO: shouldn't need this cast;
  }

  didInsertElement() {
    super.didInsertElement();
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
        return node as HTMLElement | SVGElement;
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
    this.motionService
      .unregister(this as any)
      .unobserveDescendantAnimations(this as any, this.maybeAnimate); // TODO: shouldn't need this cast
  }

  @alias('animated.isRunning')
  isAnimating!: boolean;

  @action
  maybeAnimate({ duration, task }: { duration: number; task: Promise<void> }) {
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

  @(task(function* (
    this: AnimatedContainerComponent,
    duration: number,
    animationTask: Promise<void>,
  ) {
    this._startingUp = true;
    let service = this.motionService;
    let sprite: Sprite;
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
  animate!: Task;

  <template>
    {{!
      The @class is only there to support a deprecated usage.
    }}
    {{#let (element this.tag) as |Tag|~}}
      {{! @glint-ignore: https://github.com/typed-ember/glint/issues/610 }}
      <Tag class="animated-container {{@class}}" ...attributes>
        {{yield}}
      </Tag>
    {{/let}}
  </template>
}
