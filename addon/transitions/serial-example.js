import Move from '../motions/move';

function equalBounds(a, b) {
  return ['bottom', 'height', 'left', 'right', 'top', 'width'].every(field => Math.abs(a[field] - b[field]) < 0.25);
}

export default function * serialExample() {
  for (let sprite of this.keptSprites) {
    if (!equalBounds(sprite.initialBounds, sprite.finalBounds)) {
      yield this.animate(Move, sprite, { duration: this.duration })
    }
  }
  for (let sprite of this.insertedSprites) {
    sprite.startTranslatedBy(1000, 0);
    this.animate(Move, sprite);
  }
}
