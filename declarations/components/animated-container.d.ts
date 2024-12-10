import Component from '@ember/component';
import { type Task } from '../-private/ember-scheduler.ts';
import type MotionService from '../services/-ea-motion.ts';
import type { MotionConstructor } from '../-private/motion.ts';
interface AnimatedContainerSignature<Tag extends string> {
    /** Multiple tags supported for base element via `tag` arg */
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
export default class AnimatedContainerComponent<Tag extends string = 'div'> extends Component<AnimatedContainerSignature<Tag>> {
    tagName: string;
    motionService: MotionService;
    /**
     * Use a custom tag for the container. Defaults to div.
      @argument tag
      @type String
    */
    tag: "div";
    /**
     * Whether to animate the initial render. You will probably also need to set
     * initialInsertion=true on a child component of animated-container.
     * Defaults to false.
      @argument onInitialRender
      @type Boolean
    */
    onInitialRender: boolean;
    /**
     * Use a custom motion to resize the container. Defaults to `Resize`.
      @argument motion
      @type String
    */
    motion: MotionConstructor;
    private _inserted;
    private _startingUp;
    private sprite;
    constructor(properties: Record<string, unknown> | undefined);
    didInsertElement(): void;
    private _ownElement;
    willDestroyElement(): void;
    isAnimating: boolean;
    maybeAnimate({ duration, task }: {
        duration: number;
        task: Promise<void>;
    }): void;
    beginStaticMeasurement(): void;
    endStaticMeasurement(): void;
    animate: Task;
}
export {};
//# sourceMappingURL=animated-container.d.ts.map