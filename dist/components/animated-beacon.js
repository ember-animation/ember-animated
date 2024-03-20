import Component, { setComponentTemplate } from '@ember/component';
import { inject } from '@ember/service';
import { task } from '../-private/ember-scheduler.js';
import { afterRender, microwait } from '../-private/concurrency-helpers.js';
import { componentNodes } from '../-private/ember-internals.js';
import Sprite from '../-private/sprite.js';
import { precompileTemplate } from '@ember/template-compilation';
import { g, i } from 'decorator-transforms/runtime';

var TEMPLATE = precompileTemplate("{{! template-lint-disable no-yield-only }}\n{{yield}}");

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
class AnimatedBeacon extends Component {
  name;
  tagName = '';
  _inserted = false;
  static {
    g(this.prototype, "motionService", [inject('-ea-motion')]);
  }
  #motionService = (i(this, "motionService"), void 0);
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
  _firstChildElement() {
    if (this._inserted) {
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
    }
    return undefined;
  }
  static {
    g(this.prototype, "participate", [task(function* () {
      if (!this.name) {
        throw new Error('Beacons must have a name.');
      }
      if (this.motionService.hasBeacon(this.name)) {
        return;
      }
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
    })]);
  }
  #participate = (i(this, "participate"), void 0);
}
setComponentTemplate(TEMPLATE, AnimatedBeacon);

export { AnimatedBeacon as default };
//# sourceMappingURL=animated-beacon.js.map
