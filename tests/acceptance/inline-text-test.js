import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | inline text', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /inline-text', async function(assert) {
    await visit('/inline-text');
    assert.equal(currentURL(), '/inline-text');
  });
});
