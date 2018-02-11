import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { TimeControl } from 'ember-animated/test-support';
import { animationsSettled } from 'ember-animated/test-support';

module('Acceptance | here there', function(hooks) {
  setupApplicationTest(hooks);
  let time;
  hooks.beforeEach(function() {
    time = new TimeControl();
  });
  hooks.afterEach(function() {
    time.finished();
    time = null;
  });


  test('visiting /here-there', async function(assert) {
    await visit('/here-there');
    assert.equal(currentURL(), '/here-there');
    assert.ok(this.element.querySelector('.left .demo-item'), 'found left item');
    assert.ok(!this.element.querySelector('.right .demo-item'), 'did not find left item');
  });

  test('toggling without grouping', async function(assert) {
    // this test is not supposed to animate, which is why we never
    // touch the TimeControl. If it erroneously animates, it will hang
    // and timeout.
    await visit('/here-there');
    await click(this.element.querySelector('.scenario-here-there button'));
    assert.ok(!this.element.querySelector('.left .demo-item'), 'did not find left item');
    assert.ok(this.element.querySelector('.right .demo-item'), 'found right item');
  });

  test('toggling with grouping', async function(assert) {
    await visit('/here-there');
    await click(this.element.querySelector('.scenario-here-there input[type="checkbox"]'));
    click(this.element.querySelector('.scenario-here-there button'));
    await time.advance(100);
    assert.ok(this.element.querySelector('.left .demo-item'), 'left item in flight');
    assert.ok(this.element.querySelector('.right .demo-item'), 'right item in flight');
    time.runAtSpeed(60);
    await animationsSettled();

    assert.ok(!this.element.querySelector('.left .demo-item'), 'did not find left item');
    assert.ok(this.element.querySelector('.right .demo-item'), 'found right item');
  });
});
