import { Move } from '../motions/move';
import follow from '../motions/follow';
import type Sprite from '../-private/sprite';
import type TransitionContext from '../-private/transition-context';

export const toLeft = moveOver.bind(null, 'x', -1);
export const toRight = moveOver.bind(null, 'x', 1);
export const toUp = moveOver.bind(null, 'y', -1);
export const toDown = moveOver.bind(null, 'y', 1);

function normalize(dimension: string, direction: number) {
  let position;
  let size;
  let startTranslatedBy;
  let endTranslatedBy;
  if (dimension.toLowerCase() === 'x') {
    size = (bounds: DOMRect) => bounds.width;
    if (direction > 0) {
      position = (bounds: DOMRect) => bounds.left;
      startTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.startTranslatedBy(distance, 0);
      endTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.endTranslatedBy(distance, 0);
    } else {
      position = (bounds: DOMRect) => -bounds.right;
      startTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.startTranslatedBy(-distance, 0);
      endTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.endTranslatedBy(-distance, 0);
    }
  } else {
    size = (bounds: DOMRect) => bounds.height;
    if (direction > 0) {
      position = (bounds: DOMRect) => bounds.top;
      startTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.startTranslatedBy(0, distance);
      endTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.endTranslatedBy(0, distance);
    } else {
      position = (bounds: DOMRect) => -bounds.bottom;
      startTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.startTranslatedBy(0, -distance);
      endTranslatedBy = (sprite: Sprite, distance: number) =>
        sprite.endTranslatedBy(0, -distance);
    }
  }
  return { position, size, startTranslatedBy, endTranslatedBy };
}

export default function* moveOver(
  dimension: string,
  direction: number,
  context: TransitionContext,
) {
  let { position, size, startTranslatedBy, endTranslatedBy } = normalize(
    dimension,
    direction,
  );

  let viewport: DOMRect | null;
  if (context.insertedSprites[0]) {
    viewport = context.insertedSprites[0].finalBounds;
  } else if (context.keptSprites[0]) {
    viewport = context.keptSprites[0].finalBounds;
  } else {
    throw new Error('Unimplemented');
  }

  if (context.insertedSprites[0]) {
    // Offset is how far out of place we're going to start the inserted sprite.
    let offset = 0;

    // if any leaving sprites still hang outside the viewport to the
    // left, they add to our offset because the new sprite will be to
    // their left.
    context.removedSprites.forEach((sprite: Sprite) => {
      sprite.assertHasInitialBounds();
      let o = position(viewport!) - position(sprite.initialBounds);
      if (o > offset) {
        offset = o;
      }
    });

    // the new sprite's own width adds to our offset because we want its
    // right edge (not left edge) to start touching the leftmost leaving
    // sprite (or viewport if no leaving sprites)
    let firstInserted: Sprite = context.insertedSprites[0];
    firstInserted.assertHasFinalBounds();
    offset += size(firstInserted.finalBounds);

    startTranslatedBy(firstInserted, -offset);

    if (context.removedSprites[0]) {
      endTranslatedBy(context.removedSprites[0], offset);
      let move = new Move(context.removedSprites[0]);
      move.run();
      for (const removedSprite of context.removedSprites) {
        follow(removedSprite, { source: move });
      }
      follow(firstInserted, { source: move });
    } else {
      new Move(firstInserted).run();
    }
  } else if (context.keptSprites[0]) {
    let move = new Move(context.keptSprites[0]);
    move.run();
    context.removedSprites.forEach((sprite) => {
      follow(sprite, { source: move });
    });
  } else {
    throw new Error('Unimplemented2');
  }
}
