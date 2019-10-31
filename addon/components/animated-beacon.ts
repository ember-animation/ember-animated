import Component, { TemplateFactory } from '@ember/component';
import { inject as service } from '@ember/service';
import { task, Task } from '../-private/ember-scheduler';
import { afterRender, microwait } from '..';
import { componentNodes } from '../-private/ember-internals';
import Sprite from '../-private/sprite';
import { gte } from 'ember-compatibility-helpers';

// @ts-ignore: templates don't have types
import layout from '../templates/components/animated-beacon';
import ComputedProperty from '@ember/object/computed';

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

  layout: TemplateFactory = layout;
  tagName = '';
  _inserted = false;

  @service('-ea-motion' as any) motionService: any;

  constructor(properties: any | undefined) {
    super(
      gte('3.8.0')
        ? properties
        : // in older Ember, for the Component base class to see these class
          // properties they must get passed into super:
          Object.assign(properties, { layout, tagName: '' }),
    );
    if (!gte('3.8.0')) {
      // in older Ember, any declared but not initialized class properties that
      // come in as arguments need to get re-set here because typescript
      // initializes them to undefined *after* Ember has already set them in
      // super.
      this.name = properties.name;
    }
  }

  didInsertElement() {
    super.didInsertElement();
    this._inserted = true;
    this.animationStarting = this.animationStarting.bind(this);
    this.get('motionService').observeAnimations(this.animationStarting);
  }

  willDestroyElement() {
    super.willDestroyElement();
    this.get('motionService').unobserveAnimations(this.animationStarting);
  }

  animationStarting() {
    this.get('participate').perform();
  }

  _firstChildElement(): Element | undefined {
    if (this._inserted) {
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
    }
    return undefined;
  }

  @task(function*(this: AnimatedBeacon) {
    let element = this._firstChildElement();
    if (!element) {
      return;
    }
    let offsetParent = Sprite.offsetParentStartingAt(element);
    let sprite = Sprite.positionedStartingAt(element, offsetParent);

    yield afterRender();
    yield microwait();
    yield* this.get('motionService').staticMeasurement(() => {
      offsetParent.measureFinalBounds();
      sprite.measureFinalBounds();
    });
    yield this.get('motionService')
      .get('addBeacon')
      .perform(this.name, sprite);
  })
  participate!: ComputedProperty<Task>;
}
