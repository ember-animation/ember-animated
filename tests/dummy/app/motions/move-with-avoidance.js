import Motion from 'ember-animated/motion';
import Tween from 'ember-animated/tween';
import { rAF, microwait } from 'ember-animated/concurrency-helpers';

class PathPlanner {
  constructor() {
    this.spaceResolution = 10 // pixels
    this.timeResolution = 30 // milliseconds

    this.paths = null;
    this.sprites = null;
  }
  * solve(sprite, duration) {
    if (!this.sprites) {
      // this is the first sprite to call solve within this animation
      this.sprites = new Map();
    }
    this.sprites.set(sprite, duration);

    // this gives every other concurrent sprite a chance to also call
    // solve before we continue
    yield microwait();

    if (!this.paths) {
      this._generatePaths();
    }
    let myPath = this.paths.get(sprite);

    // this gives every other concurrent sprite a chance to also grab
    // its own path
    yield microwait();

    // clear our the solution so our next run will be independent
    if (this.sprites) {
      this.sprites = null;
      this.paths = null;
    }

    return myPath;
  }

  _generatePaths() {
    this.paths = new Map();
    for (let [sprite, duration] of this.sprites.entries()) {
      // How far our sprite needs to move.
      let dx, dy;
      {
        let initial = sprite.initialBounds;
        let final = sprite.finalBounds;
        dx = final.left - initial.left;
        dy = final.top - initial.top;
      }


      // when starting a new move we start from its current position
      // (sprite.transform) and offset that based on the change in
      // bounds we want.
      let xTween = new Tween(
        sprite.transform.tx,
        sprite.transform.tx + dx,
        fuzzyZero(dx) ? 0 : duration
      );

      let yTween = new Tween(
        sprite.transform.ty,
        sprite.transform.ty + dy,
        fuzzyZero(dy) ? 0 : duration
      );

      this.paths.set(sprite, { xTween, yTween });
    }
  }
}

const pathPlanner = new PathPlanner();

export default class MoveWithAvoidance extends Motion {
  constructor(sprite, opts) {
    super(sprite, opts);
    this.prior = null;
    this.xTween = null;
    this.yTween = null;
  }

  * animate() {
    let sprite = this.sprite;
    let { xTween, yTween } = yield * pathPlanner.solve(sprite, this.duration);

    this.xTween = xTween;
    this.yTween = yTween;

    while (!this.xTween.done || !this.yTween.done) {
      sprite.translate(
        this.xTween.currentValue - sprite.transform.tx,
        this.yTween.currentValue - sprite.transform.ty
      );
      yield rAF();
    }
  }
}

// Because sitting around while your sprite animates by 3e-15 pixels
// is no fun.
function fuzzyZero(number) {
  return Math.abs(number) < 0.00001;
}
