import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | each', function (hooks) {
  setupApplicationTest(hooks);
  test('visiting /each', async function (assert) {
    await visit('/demos/each');
    assert.strictEqual(currentURL(), '/demos/each');
  });
});
