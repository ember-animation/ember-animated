import { module, test } from 'qunit';
import search from 'dummy/lib/search';

module("Unit | Search", function(hooks) {
  let points;
  let obstacles;

  class Point {
    constructor(x,y) {
      this.x = x;
      this.y = y;
    }

    static create(x,y) {
      let key = `${x}/${y}`;
      let p = points.get(key);
      if (!p) {
        p = new Point(x,y);
        points.set(key, p);
      }
      return p;
    }
  }

  function dist(a,b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function steps({ x, y }) {
    return [
      Point.create(x-1, y-1),
      Point.create(x-1, y),
      Point.create(x-1, y+1),
      Point.create(x, y-1),
      Point.create(x, y+1),
      Point.create(x+1, y-1),
      Point.create(x+1, y),
      Point.create(x+1, y+1),
    ].filter(p => !obstacles.has(p));
  }

  hooks.beforeEach(function() {
    points = new Map();
    obstacles = new Set();

  });

  test('degenerate 2D search', function(assert) {
    let path = search(Point.create(0, 0), Point.create(0, 0), steps, dist, dist);
    assert.deepEqual(path, [Point.create(0,0)]);
  });

  test('trivial 2D search', function(assert) {
    let path = search(Point.create(0, 0), Point.create(3, 0), steps, dist, dist);
    assert.deepEqual(path, [Point.create(0,0), Point.create(1,0), Point.create(2,0), Point.create(3,0)]);
  });

  test('obstacle 2D search', function(assert) {
    obstacles.add(Point.create(5,0));
    obstacles.add(Point.create(5,1));
    obstacles.add(Point.create(5,-1))
    obstacles.add(Point.create(5,2));
    obstacles.add(Point.create(5,-2));
    let path = search(Point.create(0, 0), Point.create(10, 0), steps, dist, dist);
    assert.deepEqual(path, [
      [0,0],
      [1,0],
      [2,0],
      [3,1],
      [4,2],
      [5,3],
      [6,2],
      [7,1],
      [8,1],
      [9,1],
      [10,0]
    ].map(([x,y])=>Point.create(x,y)));
  });


});
