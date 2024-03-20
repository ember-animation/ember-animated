import Component from '@ember/component';
import { type Task } from '../-private/ember-scheduler.ts';
import Sprite from '../-private/sprite.ts';
import Child from '../-private/child.ts';
import type MotionService from '../services/-ea-motion.ts';
import type { Transition } from '../-private/transition.ts';
export interface AnimatedEachSignature<T> {
    Args: {
        Positional: [T[]];
        Named: {
            items?: T[];
            /** Represents the amount of time an animation takes in miliseconds. */
            duration?: number;
            /**
             * When true, all the items in the list will animate as removedSprites when the {{#animated-each}} is destroyed. Defaults to false.
             *
             * Note that an <AnimatedOrphans/> component must be actively rendered when this animator is removed for this option to have any effect.
             */
            finalRemoval?: boolean;
            /** If set, this animator will only match other animators that have the same group value. */
            group?: string;
            /** When true, all the items in the list will animate as insertedSprites when the {{#animated-each}} is first rendered. Defaults to false. */
            initialInsertion?: boolean;
            /** Serves the same purpose as the key in ember {{#each}}, and it's also used to compare values when animating between components. */
            key?: string;
            /** Specifies data-dependent Rules that choose which Transition to run when the list changes. This takes precedence over use. */
            rules?: ((args: {
                firstTime: boolean;
                oldItems: unknown[];
                newItems: unknown[];
            }) => Transition) | undefined;
            /** Specifies the Transition to run when the list changes. */
            use?: Transition;
            /** An optional comma-separated list of properties to observe on each of the objects in the items list. If any of those properties change, we will trigger an animated transition. Without this, we only animate when the list contents change, not when any deeper properties change. */
            watch?: string;
        };
    };
    Blocks: {
        default: [T, number];
        else: [];
    };
}
/**
  A drop in replacement for `{{#each}}` that animates changes to a list.

  ```hbs
  {{#animated-each items use=transition duration=2000 as |item|}}
    <div data-test-item={{item}} onclick={{action removeItem item}}>
      {{item}}
    </div>
  {{/animated-each}}
  ```
  ```js
  import Component from '@ember/component';
  import move from 'ember-animated/motions/move';
  import { fadeOut } from 'ember-animated/motions/opacity';

  export default Component.extend({
    init() {
      this._super();
      this.items = ['A', 'B', 'C', 'D', 'E'];
    },

    * transition({ keptSprites, removedSprites }) {
      for (let sprite of keptSprites) {
        move(sprite);
      }

      for (let sprite of removedSprites) {
        fadeOut(sprite);
      }
    },

    removeItem(item){
      this.set('items', this.items.filter(i => i !== item));
    }
  });
  ```
  @class animated-each
  @public
*/
export default class AnimatedEach<T> extends Component<AnimatedEachSignature<T>> {
    tagName: string;
    static positionalParams: string[];
    motionService: MotionService;
    /**
     * The list of data you are trying to render.
      @argument items
      @type Array
    */
    items: T[];
    /**
     * If set, this animator will only [match](../../between) other animators that have the same group value.
      @argument group
      @type String
    */
    group: string | undefined;
    /**
     * Represents the amount of time an animation takes in miliseconds.
      @argument duration
      @type Number
    */
    duration: number | undefined;
    /**
     * Specifies the [Transition](../../transitions)
     * to run when the list changes.
      @argument use
      @type Transition
    */
    use: Transition | undefined;
    /**
     * Specifies data-dependent [Rules](../../rules) that choose which [Transition](../../transitions)
     * to run when the list changes. This takes precedence over `use`.
      @argument rules
      @type Rules
    */
    rules: ((args: {
        firstTime: boolean;
        oldItems: unknown[];
        newItems: unknown[];
    }) => Transition) | undefined;
    /**
     * When true, all the items in the list will animate as [`insertedSprites`](../../sprites) when the `{{#animated-each}}` is first rendered. Defaults to false.
      @argument initialInsertion
      @type Boolean
    */
    initialInsertion: boolean;
    /**
      When true, all the items in the list will animate as [`removedSprites`](../../sprites) when the `{{#animated-each}}` is destroyed. Defaults to false.
  
      Note that an `<AnimatedOrphans/>` component must be actively rendered when this animator is removed for this option to have any effect.
  
      @argument finalRemoval
      @type Boolean
    */
    finalRemoval: boolean;
    /**
      Serves the same purpose as the `key` in ember `{{#each}}`, and it's
      also used to compare values when [animating between components](../../between).
      @argument key
      @type String
    */
    key: string | undefined;
    /**
      An optional comma-separated list of properties to observe on each of the
      objects in the items list. If any of those properties change, we will
      trigger an animated transition. Without this, we only animate when the list
      contents change, not when any deeper properties change.
      @argument watch
      @type String
    */
    watch: string | undefined;
    private _elementToChild;
    private _prevItems;
    private _prevSignature;
    private _firstTime;
    private _inserted;
    private _renderedChildren;
    private _renderedChildrenStartedMoving;
    private _cycleCounter;
    private _keptSprites;
    private _insertedSprites;
    private _removedSprites;
    private _lastTransition;
    private _ancestorWillDestroyUs;
    init(): void;
    _installObservers(): void;
    get _deps(): string[] | undefined;
    get durationWithDefault(): number;
    _invalidateRenderedChildren(): void;
    _identitySignature(items: unknown[], getKey: (item: unknown, index: number) => string): string[];
    get renderedChildren(): Child<T>[];
    isAnimating: boolean;
    get keyGetter(): (item: unknown, index: number) => string;
    didInsertElement(): void;
    _ownElements(): Generator<HTMLElement | SVGElement, void, unknown>;
    maybeReanimate(): void;
    ancestorIsAnimating(ourState: Child['state']): void;
    _letSpritesEscape(): void;
    willDestroyElement(): void;
    beginStaticMeasurement(): void;
    endStaticMeasurement(): void;
    _findCurrentSprites(): {
        currentSprites: Sprite[];
        parent: Sprite | undefined;
    };
    _partitionKeptAndRemovedSprites(currentSprites: Sprite[]): void;
    animate: Task;
    startAnimation: Task;
    runAnimation: Task;
    finalizeAnimation: Task;
    _motionStarted(sprite: Sprite, cycle: number): void;
    _motionEnded(sprite: Sprite, cycle: number): void;
    _transitionFor(firstTime: boolean, oldItems: unknown[], newItems: unknown[]): Transition;
}
//# sourceMappingURL=animated-each.d.ts.map