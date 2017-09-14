import Move from '../motions/move';

export function * first() {
  this.insertedSprites.forEach(sprite => {
    sprite.reveal();
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });
}

export function * subsequent() {
  this.insertedSprites.forEach(sprite => {
    sprite.startAtPixel({ x: window.outerWidth });
    this.animate(new Move(sprite));
  });

  this.keptSprites.forEach(sprite => {
    this.animate(new Move(sprite));
  });

  this.removedSprites.forEach(sprite => {
    // the 0.8 here is purely so I can easily see that the elements
    // are being properly removed immediately after they get far
    // enough
    sprite.endAtPixel({ x: window.outerWidth * 0.8 });
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
