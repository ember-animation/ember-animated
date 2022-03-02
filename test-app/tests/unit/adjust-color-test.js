import { module, test } from 'qunit';
import Sprite from 'ember-animated/-private/sprite';
import { AdjustColor } from 'ember-animated/motions/adjust-color';
import {
  MotionTester,
  time,
  setupAnimationTest,
} from 'ember-animated/test-support';

let tester, target;

module('Unit | Adjust Color', function (hooks) {
  setupAnimationTest(hooks);
  hooks.beforeEach(function () {
    tester = MotionTester.create();
    let fixture = document.querySelector('#qunit-fixture');
    fixture.innerHTML = `
  <div class="target"></div>
`;
    target = fixture.querySelector('.target');
    target.style.width = '600px';
    target.style.height = '400px';
  });

  test('uses existing colors', async function (assert) {
    assert.expect(3);
    target.style['background-color'] = 'red';
    let sprite = makeSprite();
    target.style['background-color'] = 'blue';
    sprite.measureFinalBounds();
    let motion = new AdjustColor('background-color', sprite);
    time.pause();
    tester.run(motion, { duration: 1000 });
    await time.advance(1);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'red',
    );
    await time.advance(499);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'purple',
    );
    await time.advance(999);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'blue',
    );
  });

  test('explicit source color', async function (assert) {
    assert.expect(3);
    target.style['background-color'] = 'white';
    let sprite = makeSprite();
    target.style['background-color'] = 'white';
    sprite.measureFinalBounds();
    let motion = new AdjustColor('background-color', sprite, {
      from: 'yellow',
    });
    time.pause();
    tester.run(motion, { duration: 1000 });
    await time.advance(1);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'yellow',
    );
    await time.advance(499);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      '#ffff7f',
    );
    await time.advance(999);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'white',
    );
  });

  test('explicit destination color', async function (assert) {
    assert.expect(3);
    target.style['background-color'] = 'white';
    let sprite = makeSprite();
    target.style['background-color'] = 'white';
    sprite.measureFinalBounds();
    let motion = new AdjustColor('background-color', sprite, { to: 'yellow' });
    time.pause();
    tester.run(motion, { duration: 1000 });
    await time.advance(1);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'white',
    );
    await time.advance(499);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      '#ffff7f',
    );
    await time.advance(999);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'yellow',
    );
  });

  test('handles alpha premultiplication', async function (assert) {
    assert.expect(3);
    target.style['background-color'] = '#0000ff';
    let sprite = makeSprite();
    target.style['background-color'] = '#ff00007f';
    sprite.measureFinalBounds();
    let motion = new AdjustColor('background-color', sprite);
    time.pause();
    tester.run(motion, { duration: 1000 });
    await time.advance(1);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      '#0000ff',
    );
    await time.advance(499);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      'rgba(84, 0, 170, 0.75)',
    );
    await time.advance(999);
    assert.approxEqualColors(
      getComputedStyle(target)['background-color'],
      '#ff00007f',
    );
  });
});

function makeSprite() {
  let p = Sprite.offsetParentStartingAt(target);
  p.measureFinalBounds();
  return Sprite.positionedStartingAt(target, p);
}
