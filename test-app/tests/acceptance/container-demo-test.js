import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  setupAnimationTest,
  animationsSettled,
  time,
  bounds,
} from 'ember-animated/test-support';

module('Acceptance | container demo', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /container-demo', async function (assert) {
    await visit('demos/containerdemo');

    assert.strictEqual(currentURL(), 'demos/containerdemo');
  });

  test('toggle container', async function (assert) {
    await visit('/demos/containerdemo');
    await animationsSettled();

    time.pause();
    await click(this.element.querySelector('button'));
    await time.advance(125);

    let onePosition = bounds(this.element.querySelector('.message')).left;
    await time.advance(125);
    let twoPosition = bounds(this.element.querySelector('.message')).left;
    assert.ok(
      twoPosition < onePosition,
      `expected element .two to be animating in, ${twoPosition} > ${onePosition}`,
    );
  });
});
