import { test, module } from 'qunit';
import { TimeControl } from 'ember-animated/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

let time;

module('Acceptance | orphan', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    time = new TimeControl();
    time.runAtSpeed(40);
  });

  hooks.afterEach(function() {
    time.finished();
    time = null;
  });

  test('visiting /orphan', async function(assert) {
    await visit('/orphan');
    assert.equal(currentURL(), '/orphan');
  });
});
