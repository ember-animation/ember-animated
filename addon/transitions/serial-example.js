import Move from '../motions/move';

export default function * serialExample() {
  for (let sprite of this.insertedSprites) {
    sprite.startTranslatedBy(1000, 0);
  }

  for (let sprite of this.keptSprites) {
    yield this.animate(Move, sprite, { duration: this.duration / this.keptSprites.length })
  }

  for (let sprite of this.insertedSprites) {
    this.animate(Move, sprite);
  }
}
