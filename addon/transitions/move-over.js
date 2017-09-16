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
  if (this.insertedSprites.length) {
    viewport = this.insertedSprites[0].finalBounds;
  } else if (this.keptSprites.length) {
    viewport = this.keptSprites[0].finalBounds;
  } else {
    throw new Error("Unimplemented");
  }

  if (this.insertedSprites.length) {

    // Offset is how far out of place we're going to start the inserted sprite.
    let offset = 0;

    // if any leaving sprites still hang outside the viewport to the
    // left, they add to our offset because the new sprite will be to
    // their left.
    this.removedSprites.forEach(sprite => {
      let o = position(viewport) - position(sprite.initialBounds);
      if (o > offset) {
        offset = o;
      }
    });

    // the new sprite's own width adds to our offset because we want its
    // right edge (not left edge) to start touching the leftmost leaving
    // sprite (or viewport if no leaving sprites)
    offset += size(this.insertedSprites[0].finalBounds);

    startTranslatedBy(this.insertedSprites[0], -offset);

    if (this.removedSprites.length > 0) {
      endTranslatedBy(this.removedSprites[0], offset);
      let move = new Move(this.removedSprites[0]);
      this.animate(move);
      for (let i = 1; i < this.removedSprites.length; i++) {
        this.animate(new Follow(this.removedSprites[i], { source: move }));
      }
      this.animate(new Follow(this.insertedSprites[0], { source: move }));
    } else {
      this.animate(new Move(this.insertedSprites[0]));
    }
  } else if (this.keptSprites.length) {
    let move = new Move(this.keptSprites[0]);
    this.animate(move);
    this.removedSprites.forEach(sprite => {
      this.animate(new Follow(sprite, { source: move }));
    });
  } else {
    throw new Error("Unimplemented2");
  }
}
