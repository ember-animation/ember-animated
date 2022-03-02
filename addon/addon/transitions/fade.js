import opacity from 'ember-animated/motions/opacity';

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
export default function* ({
  removedSprites,
  insertedSprites,
  keptSprites,
  duration,
}) {
  // We yield Promise.all here because we want to wait for this
  // step before starting what comes after.
  yield Promise.all(
    removedSprites.map((s) => {
      if (s.revealed) {
        return opacity(s, {
          to: 0,
          duration: duration / 2,
        });
      }
    }),
  );

  // Once all fading out has happened, we can fade in the inserted
  // or kept sprites. Note that we get keptSprites if some things
  // were fading out and then we get interrupted and decide to
  // keep them around after all.
  insertedSprites.concat(keptSprites).map((s) =>
    opacity(s, {
      to: 1,
      duration: duration / 2,
    }),
  );
}
