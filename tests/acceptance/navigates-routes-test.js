import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | navigates routes', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /docs', async function(assert) {
    await visit('/docs');

    assert.equal(currentURL(), '/docs');
  });

  test('visiting concept pages', async function(assert) {
    await visit('/docs');
    assert.equal(currentURL(), '/docs');

    await visit('/docs/sprites');
    assert.equal(currentURL(), '/docs/sprites');

    await visit('/docs/transitions');
    assert.equal(currentURL(), '/docs/transitions');

    await visit('/docs/motions');
    assert.equal(currentURL(), '/docs/motions');

    await visit('/docs/rules');
    assert.equal(currentURL(), '/docs/rules');

    await visit('/docs/beacons');
    assert.equal(currentURL(), '/docs/beacons');


  });





});
