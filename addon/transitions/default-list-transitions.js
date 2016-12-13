import Move from '../motions/move';

export function * first() {
  this.insertedSprites.forEach(sprite => {
    let oldSprite = this.matchFor(sprite);
    if (oldSprite) {
      sprite.startAt(oldSprite);
      this.animate(new Move(sprite));
    } else {
      sprite.reveal();
    }
  });
}

export function * subsequent() {
  this.insertedSprites.forEach(sprite => {
    let oldSprite = this.matchFor(sprite);
    if (oldSprite) {
      sprite.startAt(oldSprite);
      this.animate(new Move(sprite));
    } else {
      sprite.startTranslatedBy(1000, 0);
      this.animate(new Move(sprite));
    }
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });

  this.removedSprites.forEach(sprite => {
    // the 200 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endTranslatedBy(window.outerWidth - sprite.initialBounds.left - 200, 0);
    this.animate(new Move(sprite));
  });

}

export default function rules(firstTime) {
  if (firstTime) {
    return first;
  } else {
    return subsequent;
  }
}
