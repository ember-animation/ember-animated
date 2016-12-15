import Move from '../motions/move';
import Follow from '../motions/follow';

export function toLeft() {
  return moveOver.call(this, 'x', -1);
}

export function toRight() {
  return moveOver.call(this, 'x', 1);
}

export function toUp() {
  return moveOver.call(this, 'y', -1);
}

export function toDown() {
  return moveOver.call(this, 'y', 1);
}

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
  return { position, size, startTranslatedBy, endTranslatedBy };
}

export default function * moveOver(dimension, direction) {
  let {
    position,
    size,
    startTranslatedBy,
    endTranslatedBy,
  } = normalize(dimension, direction);

  let viewport;
  if (this.insertedSprite) {
    viewport = this.insertedSprite.finalBounds;
  } else if (this.keptSprite) {
    viewport = this.keptSprite.finalBounds;
  } else {
    throw new Error("Unimplemented");
  }

  // if we're interrupting a previous move-over that went in the
  // opposite direction, some removedSprites may already be offscreen
  // and would come back onscreen if we didn't drop them here. Also,
  // by not animating a removed sprite we make it eligible to be GCed
  // if our animation is interrupted and restarts.
  let leavingSprites;
  {
    let viewportPosition = position(viewport);
    let viewportSize = size(viewport);
    leavingSprites = this.removedSprites.filter(sprite => {
      let p = position(sprite.initialBounds);
      let s = size(sprite.initialBounds);
      return p + s >= viewportPosition && p <= viewportPosition + viewportSize;
    });
  }

  if (this.insertedSprite) {

    // Offset is how far out of place we're going to start the inserted sprite.
    let offset = 0;

    // if any leaving sprites still hang outside the viewport to the
    // left, they add to our offset because the new sprite will be to
    // their left.
    leavingSprites.forEach(sprite => {
      let o = position(viewport) - position(sprite.initialBounds);
      if (o > offset) {
        offset = o;
      }
    });

    // the new sprite's own width adds to our offset because we want its
    // right edge (not left edge) to start touching the leftmost leaving
    // sprite (or viewport if no leaving sprites)
    offset += size(this.insertedSprite.finalBounds);

    startTranslatedBy(this.insertedSprite, -offset);

    if (leavingSprites.length > 0) {
      endTranslatedBy(leavingSprites[0], offset);
      let move = new Move(leavingSprites[0]);
      this.animate(move);
      for (let i = 1; i < leavingSprites.length; i++) {
        this.animate(new Follow(leavingSprites[i], { source: move }));
      }
      this.animate(new Follow(this.insertedSprite, { source: move }));
    } else {
      this.animate(new Move(this.insertedSprite));
    }
  } else if (this.keptSprite) {
    let move = new Move(this.keptSprite);
    this.animate(move);
    leavingSprites.forEach(sprite => {
      this.animate(new Follow(sprite, { source: move }));
    });
  } else {
    throw new Error("Unimplemented2");
  }
}
