import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | direct style', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /direct-style', async function (assert) {
    await visit('/demos/direct-style');
    assert.strictEqual(currentURL(), '/demos/direct-style');
  });
});
