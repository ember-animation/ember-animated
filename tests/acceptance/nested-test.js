import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | nested', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /nested', async function(assert) {
    await visit('/nested');
    assert.equal(currentURL(), '/nested');
  });
});
