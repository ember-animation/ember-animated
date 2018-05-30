import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupAnimationTest, animationsSettled, bounds, time } from 'ember-animated/test-support';
import QUnit from 'qunit';

module('Acceptance | each demo', function(hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /eachdemo', async function(assert) {
    await visit('demos/eachdemo');
    assert.equal(currentURL(), 'demos/eachdemo');
  });

  hooks.beforeEach(function(assert) {
    assert.listContents = function( elts, expected, message ) {
      let values = [...elts].map(e => e.textContent.trim());
      this.pushResult({
        result: QUnit.equiv(values, expected),
        actual: values,
        expected: expected,
        message: message
      });
    };
  });

  test('/eachdemo first removal', async function(assert) {
    await visit('/demos/eachdemo');
    let APosition = bounds(this.element.querySelector('[data-test-item="A"]'));
    let BPosition = bounds(this.element.querySelector('[data-test-item="B"]'));
    time.pause();
    await click(this.element.querySelector('[data-test-item="A"]'));
    await time.advance(2000);
    let B2Position = bounds(this.element.querySelector('[data-test-item="B"]'));
    assert.strictEqual(B2Position.top, APosition.top, "final B is initial A");
    assert.notEqual(B2Position.top, BPosition.top, "final B is above initial B");
    time.runAtSpeed(60);
    await animationsSettled();
  });

});
