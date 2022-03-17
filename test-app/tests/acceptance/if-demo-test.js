import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  setupAnimationTest,
  animationsSettled,
  time,
  bounds,
} from 'ember-animated/test-support';

module('Acceptance | if demo', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /if-demo', async function (assert) {
    await visit('demos/ifdemo');

    assert.strictEqual(currentURL(), 'demos/ifdemo');
  });

  test('toggle thing', async function (assert) {
    await visit('demos/ifdemo');
    await animationsSettled();

    time.pause();
    await click('button');
    await time.advance(125);

    let onePosition = bounds(find('.message')).left;
    await time.advance(125);
    let twoPosition = bounds(find('.message')).left;
    assert.ok(
      twoPosition < onePosition,
      `expected element .two to be animating in, ${twoPosition} > ${onePosition}`,
    );
  });
});
