import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  bounds,
  setupAnimationTest,
  time,
  animationsSettled,
} from 'ember-animated/test-support';

module('Acceptance | beacon demo', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /beacon-demo', async function (assert) {
    await visit('/demos/beacondemo');
    assert.strictEqual(currentURL(), '/demos/beacondemo');
  });

  test('opening modal begins near button', async function (assert) {
    await visit('/demos/beacondemo');
    time.pause();
    await click('button');
    await time.advance(10);
    let modal = bounds(find('.beacon-demo--message'));
    let button = bounds(find('button'));
    assert.closeBounds(5, modal, button, 'modal should be near button');
  });

  test('closing modal ends near button', async function (assert) {
    await visit('/demos/beacondemo');
    await click('button');
    await animationsSettled();

    time.pause();
    await click('.beacon-demo--message');
    await time.advance(490);

    let modal = bounds(find('.beacon-demo--message'));
    let button = bounds(find('button'));
    assert.closeBounds(5, modal, button, 'modal should be near button');
  });
});
