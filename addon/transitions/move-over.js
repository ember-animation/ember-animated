import Move from '../motions/move';

export function toLeft() {
  return moveOver.call(this, 'x', 1);
}

export function toRight() {
  return moveOver.call(this, 'x', -1);
}

export function toUp() {
  return moveOver.call(this, 'y', 1);
}

export function toDown() {
  return moveOver.call(this, 'y', -1);
}


export default function * moveOver(dimension, direction) {
  let measure = dimension.toLowerCase() === 'x' ? 'width' : 'height';
  let tx = 0;
  let ty = 0;
  if (measure === 'width') {
    tx = biggestSize(this, measure);
  } else {
    ty = biggestSize(this, measure);
  }

  this.removedSprites.forEach(sprite => {
    sprite.endTranslatedBy(-tx * direction, -ty * direction);
    this.animate(Move, sprite);
  });
  this.insertedSprites.forEach(sprite => {
    sprite.startTranslatedBy(tx * direction, ty * direction);
    this.animate(Move, sprite);
  });
}

function biggestSize(context, dimension) {
  var sizes = [];
  if (context.insertedSprite) {
    sizes.push(context.insertedSprite.finalBounds[dimension]);
    //sizes.push(parseInt(context.insertedSprite.parent().css(dimension), 10));
  }
  if (context.removedSprite) {
    sizes.push(context.removedSprite.initialBounds[dimension]);
    //sizes.push(parseInt(context.removedSprite.parent().css(dimension), 10));
  }
  return Math.max.apply(null, sizes);
}
