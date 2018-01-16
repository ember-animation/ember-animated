import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

module('Acceptance | swapping lists', function(hooks){
  setupApplicationTest(hooks);
  test('visiting /swapping-lists', async function(assert) {
    await visit('/swapping-lists');
    assert.equal(currentURL(), '/swapping-lists');
  });
});
