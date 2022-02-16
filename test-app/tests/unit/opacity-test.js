import { module, test } from 'qunit';
import Sprite from 'ember-animated/-private/sprite';
import { Opacity } from 'ember-animated/motions/opacity';
import { MotionTester, TimeControl } from 'ember-animated/test-support';

let tester, target, time;

function makeSprite() {
  let p = Sprite.offsetParentStartingAt(target);
  p.measureFinalBounds();
  return Sprite.positionedStartingAt(target, p);
}

module('Unit | Opacity', function (hooks) {
  hooks.beforeEach(function () {
    time = new TimeControl();

    tester = MotionTester.create({
      motion: Opacity,
    });

    let fixture = document.querySelector('#qunit-fixture');
    fixture.innerHTML = `
  <div class="target"></div>
`;
    target = fixture.querySelector('.target');
    target.style.width = '600px';
    target.style.height = '400px';
  });

  hooks.afterEach(function () {
    time.finished();
  });

  test('fade in', async function (assert) {
    assert.expect(2);
    target.style.opacity = 0;
    let sprite = makeSprite();
    target.style.opacity = 1;
    sprite.measureFinalBounds();
    tester.run(sprite, { duration: 1000 });
    await time.advance(250);
    assert.strictEqual(target.style.opacity, '0.25');
    await time.advance(750);
    assert.strictEqual(target.style.opacity, '1');
  });

  test('fade in to preexisting opacity', async function (assert) {
    assert.expect(2);
    target.style.opacity = 0;
    let sprite = makeSprite();
    target.style.opacity = 0.75;
    sprite.measureFinalBounds();
    tester.run(sprite, { duration: 1000 });
    assert.strictEqual(target.style.opacity, '0');
    await time.advance(750);
    assert.strictEqual(target.style.opacity, '0.75');
  });

  test('fade out', async function (assert) {
    assert.expect(2);
    target.style.opacity = 1;
    let sprite = makeSprite();
    target.style.opacity = 0;
    sprite.measureFinalBounds();
    target.style.opacity = 1;
    tester.run(sprite, { duration: 1000 });
    await time.advance(250);
    assert.strictEqual(target.style.opacity, '0.75');
    await time.advance(750);
    assert.strictEqual(target.style.opacity, '0');
  });

  test('fade out to preexisting opacity', async function (assert) {
    assert.expect(2);
    target.style.opacity = 1;
    let sprite = makeSprite();
    target.style.opacity = 0.3;
    sprite.measureFinalBounds();
    sprite.lock();
    tester.run(sprite, { duration: 1000 });
    await time.advance(350);
    assert.strictEqual(target.style.opacity, '0.65');
    await time.advance(350);
    assert.strictEqual(target.style.opacity, '0.3');
  });

  test('interrupt', async function (assert) {
    assert.expect(2);
    target.style.opacity = 0;
    let sprite = makeSprite();
    target.style.opacity = 1;
    sprite.measureFinalBounds();
    sprite.lock();
    tester.run(sprite, { duration: 1000 });
    await time.advance(500);

    sprite = makeSprite();
    target.style.opacity = 0;
    sprite.measureFinalBounds();
    sprite.lock();

    // this asks for { from: 1 }, but we're going to assert that the
    // motion ignores us due to the interruption and instead picks up
    // smoothly from where we left off.
    tester.run(sprite, { duration: 1000, from: 1, to: 0 });

    await time.advance(250);
    assert.strictEqual(target.style.opacity, '0.25');
    await time.advance(250);
    assert.strictEqual(target.style.opacity, '0');
  });
});
