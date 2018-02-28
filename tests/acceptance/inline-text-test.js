import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { TimeControl, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | inline text', function(hooks) {
  setupApplicationTest(hooks);
  let time;
  hooks.afterEach(() => {
    if (time) {
      time.finished();
      time = null;
    }
  });


  test('visiting /inline-text', async function(assert) {
    await visit('/inline-text');
    assert.equal(currentURL(), '/inline-text');
  });

  test('/inline-text first transition', async function(assert) {
    assert.expect(0);
    await visit('/inline-text');
    time = new TimeControl();
    time.runAtSpeed(40);
    await click(this.element.querySelector('button'));
    await animationsSettled();
  });

  test('/inline-text second transition', async function(assert) {
    assert.expect(0);
    await visit('/inline-text');
    time = new TimeControl();
    time.runAtSpeed(40);
    await click(this.element.querySelector('button'));
    await animationsSettled();
    await click(this.element.querySelector('button'));
    await animationsSettled();
  });
});
