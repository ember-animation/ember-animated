import { test, module } from 'qunit';
import { TimeControl } from 'ember-animated/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { findByText } from '../helpers/dom';

let time;

module('Acceptance | bind', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(function () {
    time = new TimeControl();
    time.runAtSpeed(40);
  });
  hooks.afterEach(function () {
    time.finished();
    time = null;
  });

  test('visiting /bind', async function (assert) {
    await visit('/demos/bind');
    assert.strictEqual(currentURL(), '/demos/bind');
  });

  test('clicking the button', async function (assert) {
    let number;

    await visit('/demos/bind');
    number = parseInt(this.element.querySelector('.left-count').textContent);

    await click(findByText(this.element, 'button', '+'));
    let finalNumber = parseInt(
      this.element.querySelector('.left-count').textContent,
    );
    assert.strictEqual(finalNumber, number + 1);
  });
});
