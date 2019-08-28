import { Motion, rAF, Tween } from '..';

const HEIGHT_AND_WIDTH_OPTS = ['fromHeight', 'toHeight', 'fromWidth', 'toWidth'];

/**
  Smoothly resizes _sprite_ from its the initial size to its final size.

  _sprite_ must have both `initialBounds` and `finalBounds` set.

  Consider using `scale` instead because scale uses CSS transforms and will not trigger reflow.

  ```js
  for (let sprite of insertedSprites) {
    sprite.startAtSprite(beacons['source']);
    resize(sprite)
  }
  ```

  @function resize
  @export default
  @param {Sprite} sprite
  @return {Motion}
*/
export default function resize(sprite, opts) {
  return new Resize(sprite, opts).run();
}

export class Resize extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.widthTween = null;
    this.heightTween = null;
  }

  interrupted(motions) {
    this.prior = motions.find(m => m instanceof this.constructor);
  }

  /**
   * Extracts initial/final height and width from the `this.opts` object. Required for sprites wrapped in a resize
   * `animated-if`, as they may not have `initialBounds` or `finalBounds` of their own
   * @private
   */
  _extractHeightAndWidthOpts() {
    const returnVariables = {};
    HEIGHT_AND_WIDTH_OPTS.forEach(optionKey => {
      let bounds = 'initialBounds';
      let transform = 'initialCumulativeTransform';
      let transformProp = 'a';
      let dimension = 'width';
      let option = this.opts[optionKey];

      if (optionKey.indexOf('to') > -1) {
        bounds = 'finalBounds';
        transform = 'finalCumulativeTransform';
      }
      if (optionKey.indexOf('Height') > -1) {
        dimension = 'height';
        transformProp = 'd';
      }

      if (option != null) {
        // User passed in option
        returnVariables[optionKey] = option;
        returnVariables[transform] = { ...this.sprite[transform], ...returnVariables[transform], [transformProp]: 1 };
      } else {
        let spriteBounds = this.sprite[bounds];

        if (spriteBounds != null) {
          returnVariables[optionKey] = spriteBounds[dimension]
        } else {
          // If the sprite has no `initialBounds` or `finalBounds` key, then we use alternate bounds value
          // This results in the same start and end attribute, meaning the that the sprite won't animate on that plane
          let alternateBounds = bounds === 'initialBounds' ? 'finalBounds' : 'initialBounds'
          returnVariables[optionKey] = this.sprite[alternateBounds][dimension]
        }
        returnVariables[transform] = { ...this.sprite[transform], ...returnVariables[transform] };
      }
    });

    return returnVariables;
  }

  * animate() {
    let sprite = this.sprite;
    let duration = this.duration;
    let { fromHeight, toHeight, fromWidth, toWidth, initialCumulativeTransform,
      finalCumulativeTransform } = this._extractHeightAndWidthOpts();

    if (!this.prior) {
      this.widthTween =  new Tween(
          fromWidth / initialCumulativeTransform.a,
          toWidth / finalCumulativeTransform.a, duration
        );

      this.heightTween = new Tween(
          fromHeight / initialCumulativeTransform.d,
          toHeight / finalCumulativeTransform.d, duration
        );
    } else {
      this.widthTween = new Tween(
          0,
          toWidth / finalCumulativeTransform.a - this.prior.sprite.finalBounds.width,
          duration
        ).plus(this.prior.widthTween);

      this.heightTween = new Tween(
          0,
          toHeight / finalCumulativeTransform.d - this.prior.sprite.finalBounds.height,
          duration
        ).plus(this.prior.heightTween);
    }

    while (!this.widthTween.done || !this.heightTween.done) {
      sprite.applyStyles({
        width:this.widthTween.currentValue,
        height: this.heightTween.currentValue
      });
      yield rAF();
    }
  }
}
