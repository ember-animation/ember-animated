import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | collision avoidance', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /collision-avoidance', async function(assert) {
    await visit('/collision-avoidance');
    assert.equal(currentURL(), '/collision-avoidance');
  });
});
