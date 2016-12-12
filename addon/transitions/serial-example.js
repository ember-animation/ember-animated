import Move from '../motions/move';

export default function * serialExample() {
  for (let sprite of this.insertedSprites) {
    sprite.startTranslatedBy(1000, 0);
  }

  for (let sprite of this.keptSprites) {
    let move = new Move(sprite);
    move.duration = this.duration / this.keptSprites.length;
    yield this.animate(move);
  }

  for (let sprite of this.insertedSprites) {
    this.animate(new Move(sprite));
  }
}
