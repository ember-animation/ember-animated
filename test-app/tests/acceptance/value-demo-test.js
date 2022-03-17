import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { TimeControl } from 'ember-animated/test-support';
import { click } from '@ember/test-helpers';
import { findByText } from '../helpers/dom';

let time;

module('Acceptance | value demo', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(function () {
    time = new TimeControl();
    time.runAtSpeed(40);
  });
  hooks.afterEach(function () {
    time.finished();
    time = null;
  });

  test('visiting /valuedemo', async function (assert) {
    await visit('demos/valuedemo');
    assert.strictEqual(currentURL(), 'demos/valuedemo');
  });

  test('clicking the button', async function (assert) {
    let number;

    await visit('/demos/valuedemo');
    number = parseInt(find('.numbers').textContent);

    await click(findByText('button', '+'));
    let finalNumber = parseInt(find('.numbers').textContent);
    assert.strictEqual(finalNumber, number + 1);
  });
});
