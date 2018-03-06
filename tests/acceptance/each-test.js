import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | each', function(hooks){
  setupApplicationTest(hooks);
  test('visiting /each', async function(assert) {
    await visit('/dev/each');
    assert.equal(currentURL(), '/dev/each');
  });
});
