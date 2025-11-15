import { Move } from '../motions/move.js';
import follow from '../motions/follow.js';

const toLeft = moveOver.bind(null, 'x', -1);
const toRight = moveOver.bind(null, 'x', 1);
const toUp = moveOver.bind(null, 'y', -1);
const toDown = moveOver.bind(null, 'y', 1);
function normalize(dimension, direction) {
  let position;
  let size;
  let startTranslatedBy;
  let endTranslatedBy;
  if (dimension.toLowerCase() === 'x') {
    size = bounds => bounds.width;
    if (direction > 0) {
      position = bounds => bounds.left;
      startTranslatedBy = (sprite, distance) => sprite.startTranslatedBy(distance, 0);
      endTranslatedBy = (sprite, distance) => sprite.endTranslatedBy(distance, 0);
    } else {
      position = bounds => -bounds.right;
      startTranslatedBy = (sprite, distance) => sprite.startTranslatedBy(-distance, 0);
      endTranslatedBy = (sprite, distance) => sprite.endTranslatedBy(-distance, 0);
    }
  } else {
    size = bounds => bounds.height;
    if (direction > 0) {
      position = bounds => bounds.top;
      startTranslatedBy = (sprite, distance) => sprite.startTranslatedBy(0, distance);
      endTranslatedBy = (sprite, distance) => sprite.endTranslatedBy(0, distance);
    } else {
      position = bounds => -bounds.bottom;
      startTranslatedBy = (sprite, distance) => sprite.startTranslatedBy(0, -distance);
      endTranslatedBy = (sprite, distance) => sprite.endTranslatedBy(0, -distance);
    }
  }
  return {
    position,
    size,
    startTranslatedBy,
    endTranslatedBy
  };
}

// eslint-disable-next-line require-yield
function* moveOver(dimension, direction, context) {
  let {
    position,
    size,
    startTranslatedBy,
    endTranslatedBy
  } = normalize(dimension, direction);
  let viewport;
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
    context.removedSprites.forEach(sprite => {
      sprite.assertHasInitialBounds();
      let o = position(viewport) - position(sprite.initialBounds);
      if (o > offset) {
        offset = o;
      }
    });

    // the new sprite's own width adds to our offset because we want its
    // right edge (not left edge) to start touching the leftmost leaving
    // sprite (or viewport if no leaving sprites)
    let firstInserted = context.insertedSprites[0];
    firstInserted.assertHasFinalBounds();
    offset += size(firstInserted.finalBounds);
    startTranslatedBy(firstInserted, -offset);
    if (context.removedSprites[0]) {
      endTranslatedBy(context.removedSprites[0], offset);
      let move = new Move(context.removedSprites[0]);
      move.run();
      for (const removedSprite of context.removedSprites) {
        follow(removedSprite, {
          source: move
        });
      }
      follow(firstInserted, {
        source: move
      });
    } else {
      new Move(firstInserted).run();
    }
  } else if (context.keptSprites[0]) {
    const move = new Move(context.keptSprites[0]);
    move.run();
    context.removedSprites.forEach(sprite => {
      follow(sprite, {
        source: move
      });
    });
  } else {
    throw new Error('Unimplemented2');
  }
}

export { moveOver as default, toDown, toLeft, toRight, toUp };
//# sourceMappingURL=move-over.js.map
