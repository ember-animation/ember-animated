import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { Resize } from '../motions/resize';
import { task } from '../-private/ember-scheduler';
import Sprite from '../-private/sprite';
import { afterRender, microwait } from '..';
import { componentNodes } from '../-private/ember-internals';
import layout from '../templates/components/animated-container';
import { deprecate } from '@ember/application/deprecations';

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
export default Component.extend({
  layout,
  tagName: '',

  motionService: service('-ea-motion'),
  /**
   * Use a custom tag for the container. Defaults to div.
    @argument tag
    @type String
  */
  tag: 'div',
  /**
   * Whether to animate the initial render. You will probably also need to set
   * initialInsertion=true on a child component of animated-container.
   * Defaults to false.
    @argument onInitialRender
    @type Boolean
  */
  onInitialRender: false,

  init() {
    this._super();
    this._signals = null;
    this._signalPromise = null;
    this._signalResolve = null;
    this._inserted = false;
    this._startingUp = false;
    this.maybeAnimate = this.maybeAnimate.bind(this);
    this.sprite = null;
    this.get('motionService')
      .register(this)
      .observeDescendantAnimations(this, this.maybeAnimate);

    deprecate(
      `passing a "class" argument to animated-container is deprecated. Switch to angle bracket invocation and pass an HTML attribute instead`,
      !this.class,
      {
        id: 'ember-animated-container-class-arg',
        until: '1.0.0',
      },
    );
  },

  didInsertElement() {
    this._inserted = true;
  },

  _ownElement() {
    if (this._inserted) {
      return componentNodes(this).firstNode;
    }
  },

  willDestroyElement() {
    this.get('motionService')
      .unregister(this)
      .unobserveDescendantAnimations(this, this.maybeAnimate);
  },

  isAnimating: alias('animate.isRunning'),

  maybeAnimate({ duration, task }) {
    if (!this._startingUp) {
      this.get('animate').perform(duration, task);
    }
  },

  beginStaticMeasurement() {
    if (this.sprite) {
      this.sprite.unlock();
    }
  },

  endStaticMeasurement() {
    if (this.sprite) {
      this.sprite.lock();
    }
  },

  animate: task(function*(duration, animationTask) {
    this._startingUp = true;
    let service = this.get('motionService');
    let sprite;
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
        sprite = Sprite.sizedEndingAt(this._ownElement());
        this.sprite = sprite;
      } else {
        sprite.measureFinalBounds();
      }
    });

    if (useMotion) {
      yield* new (this.motion || Resize)(this.sprite, { duration })._run();
    }

    yield animationTask;

    this.sprite.unlock();
    this.sprite = null;
  }).restartable(),
});
