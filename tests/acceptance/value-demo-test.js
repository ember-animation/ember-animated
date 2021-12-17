import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
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
    number = parseInt(this.element.querySelector('.numbers').textContent);

    await click(findByText(this.element, 'button', '+'));
    let finalNumber = parseInt(
      this.element.querySelector('.numbers').textContent,
    );
    assert.strictEqual(finalNumber, number + 1);
  });
});
