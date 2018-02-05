import Motion from 'ember-animated/motion';
import Tween from 'ember-animated/tween';
import { rAF, microwait } from 'ember-animated/concurrency-helpers';

class PathPlanner {
  constructor() {
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
    const spaceResolution = 10; // pixels
    const timeResolution  = 30; // milliseconds

    let paths = new Map();
    let usedPoints = new Map();

    for (let [sprite, duration] of this.sprites.entries()) {


      let { left: xStart, top: yStart } = sprite.absolute('initialBounds');
      let { left: xEnd, top: yEnd } = sprite.absolute('finalBounds');

      let initialState = { x: xStart, y: yStart, xMomentum: 0, yMomentum: 0, time: 0 };
      let goalState = { x: xEnd, y: yEnd, xMomentum: 0, yMomentum: 0, time: duration };

      let path = search(initialState, goalState, usedPoints);
      let { xTween, yTween } = pathToTweens(sprite, path);
      paths.set(sprite, { xTween, yTween });
      for (let point of path) {
        if (!usedPoints.has(point.time)) {
          usedPoints.set(point.time, [])
        }
        usedPoints.get(point.time).push(point);
      }
    }
    this.paths = paths;
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

class Point {
  constructor(x,y,vx,vy,time) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    time.time = time;
  }
}

class ConfigurationSpace {
  constructor({ maxAcceleration, timeResolution}) {
    this.points = new Map();
    if (maxAcceleration == null) {
      maxAcceleration = 1;
    }
    this.timeResolution = timeResolution || 10;

    let diagonalAcceleration = maxAcceleration * Math.sqrt(2) / 2;
    this.accelerationChoices = [
      [-diagonalAcceleration, -diagonalAcceleration],
      [-maxAcceleration, 0],
      [-diagonalAcceleration, diagonalAcceleration],
      [0, -maxAcceleration],
      [0, 0],
      [0, maxAcceleration],
      [diagonalAcceleration, -diagonalAcceleration],
      [maxAcceleration, 0],
      [diagonalAcceleration, diagonalAcceleration]
    ];
  }
  point(x,y,vx,vy,time) {
    let key = `${x}/${y}/${vx}/${vy}/${time}`;
    let p = this.points.get(key);
    if (!p) {
      p = new Point(x,y,vx, vy, time);
      this.points.set(key, p);
    }
    return p;
  }
  distance(a, b) {
    let accum = 0;
    let tmp = a.x - b.x;
    accum += tmp * tmp;
    tmp = a.y - b.y;
    accum += tmp * tmp;
    tmp = a.vx - b.vx
    accum += tmp * tmp;
    tmp = a.vy - b.vy
    accum += tmp * tmp;
    tmp = a.time - b.time
    accum += tmp * tmp;
    return accum;
  }
  neighbors(point) {
    let time = point.time + this.timeResolution;
    return this.accelerationChoices.map(([ax, ay]) => {
      let vx = ax + point.vx;
      let vy = ay + point.vy;
      this.point(point.x + vx, point.y + vy, vx, vy, time)
    });
  }
}
