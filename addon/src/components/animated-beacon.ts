import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task, type Task } from '../-private/ember-scheduler';
import { afterRender, microwait } from '../-private/concurrency-helpers';
import { componentNodes } from '../-private/ember-internals';
import Sprite from '../-private/sprite';
import type MotionService from '../services/-ea-motion';

/**
  A component that marks a region of the page that
  can serve as a source or destination for sprites to animate to and from.

  ```hbs
  {{#animated-beacon name="one"}}
    <button {{action "launch"}}>Launch</button>
  {{/animated-beacon}}

  {{#animated-if showThing use=transition}}
    <div class="message" {{action "dismiss"}}>
      Hello
    </div>
  {{/animated-if}}
  ```

  ```js
  import Component from '@ember/component';
  import move from 'ember-animated/motions/move';
  import scale from 'ember-animated/motions/scale';

  export default Component.extend({
    showThing: false,

    transition: function *({ insertedSprites, keptSprites, removedSprites, beacons }) {
      for (let sprite of insertedSprites) {
        sprite.startAtSprite(beacons.one);
        move(sprite);
        scale(sprite);
      }

      for (let sprite of keptSprites) {
        move(sprite);
      }

      for (let sprite of removedSprites) {
        sprite.endAtSprite(beacons.one);
        move(sprite);
        scale(sprite);
      }
    });
  },

    actions: {
      launch() {
        this.set('showThing', true);
      },
      dismiss() {
        this.set('showThing', false);
      }
    }
  });
  ```
  @class animated-beacon
  @public
*/
export default class AnimatedBeacon extends Component {
  name: string | undefined;

  tagName = '';
  _inserted = false;

  @service('-ea-motion')
  motionService!: MotionService;

  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
    this.animationStarting = this.animationStarting.bind(this);
    this.motionService.observeAnimations(this.animationStarting);
  }

  willDestroyElement() {
    super.willDestroyElement();
    this.motionService.unobserveAnimations(this.animationStarting);
  }

  animationStarting() {
    this.participate.perform();
  }

  _firstChildElement(): HTMLElement | SVGElement | undefined {
    if (this._inserted) {
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
    }
    return undefined;
  }

  @task(function* (this: AnimatedBeacon) {
    let element = this._firstChildElement();
    if (!element) {
      return;
    }
    let offsetParent = Sprite.offsetParentStartingAt(element);
    let sprite = Sprite.positionedStartingAt(element, offsetParent);

    yield afterRender();
    yield microwait();
    yield* this.motionService.staticMeasurement(() => {
      offsetParent.measureFinalBounds();
      sprite.measureFinalBounds();
    });
    yield this.motionService.addBeacon.perform(this.name, sprite);
  })
  participate!: Task;
}
