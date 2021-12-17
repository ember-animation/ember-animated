import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | container only', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /container-only', async function (assert) {
    await visit('/demos/container-only');
    assert.strictEqual(currentURL(), '/demos/container-only');
  });
});
