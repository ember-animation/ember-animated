import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | two lists', function(hooks){
  setupApplicationTest(hooks);
  test('visiting /two-lists', async function(assert) {
    await visit('/dev/two-lists');
    assert.equal(currentURL(), '/dev/two-lists');
  });
});
