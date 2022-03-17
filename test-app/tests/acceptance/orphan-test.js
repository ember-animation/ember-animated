import { test, module } from 'qunit';
import {
  setupAnimationTest,
  animationsSettled,
  time,
  bounds,
} from 'ember-animated/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click, find } from '@ember/test-helpers';

module('Acceptance | orphan', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /orphan', async function (assert) {
    time.pause();
    await visit('/demos/orphan');
    await time.advance(1000);

    let opacity = parseFloat(getComputedStyle(find('.one')).opacity);
    let animating = opacity > 0 && opacity < 1;
    assert.ok(animating, `expected opacity to be animating, it's ${opacity}`);

    let onePosition = bounds(find('.one')).left;
    let twoPosition = bounds(find('.two')).left;

    assert.ok(
      twoPosition > onePosition,
      `expected element .two to be animating in, ${twoPosition} > ${onePosition}`,
    );
    time.runAtSpeed(40);
    await animationsSettled();
    assert.strictEqual(currentURL(), '/demos/orphan');
  });

  test('toggle /orphan out', async function (assert) {
    await visit('/demos/orphan');
    await animationsSettled();

    time.pause();
    await click('button');
    await time.advance(1000);

    let opacity = parseFloat(getComputedStyle(find('.one')).opacity);
    let animating = opacity > 0 && opacity < 1;
    assert.ok(animating, `expected opacity to be animating, it's ${opacity}`);

    let onePosition = bounds(find('.one')).left;
    let twoPosition = bounds(find('.two')).left;
    assert.ok(
      twoPosition > onePosition,
      `expected element .two to be animating out, ${twoPosition} > ${onePosition}`,
    );
  });
});
