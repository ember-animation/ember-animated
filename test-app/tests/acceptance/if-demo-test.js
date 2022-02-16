import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
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
