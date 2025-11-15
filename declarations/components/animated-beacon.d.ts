import Component from '@ember/component';
import { type Task } from '../-private/ember-scheduler.ts';
import type MotionService from '../services/-ea-motion.ts';
interface AnimatedBeaconSignature {
    Args: {
        name: string;
    };
    Blocks: {
        default: [];
    };
}
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
export default class AnimatedBeacon extends Component<AnimatedBeaconSignature> {
    name: string | undefined;
    tagName: string;
    _inserted: boolean;
    motionService: MotionService;
    didInsertElement(): void;
    willDestroyElement(): void;
    animationStarting(): void;
    _firstChildElement(): HTMLElement | SVGElement | undefined;
    participate: Task;
}
export {};
//# sourceMappingURL=animated-beacon.d.ts.map