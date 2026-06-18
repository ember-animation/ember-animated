import type TransitionContext from '../-private/transition-context.ts';
/**
  Fades inserted, removed, and kept sprites.

  ```js
  import fade from 'ember-animated/transitions/fade';

  export default Component.extend({
    transition: fade
  });
  ```

  ```hbs
  {{#animated-if use=transition}}
    ...
  {{/animated-if}}
  ```

  @function fade
  @export default
*/
export default function ({ removedSprites, insertedSprites, keptSprites, duration, }: TransitionContext): Generator<Promise<any[]>, void, unknown>;
//# sourceMappingURL=fade.d.ts.map