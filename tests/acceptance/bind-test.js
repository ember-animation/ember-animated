import { test, module } from 'qunit';
import { TimeControl } from 'ember-animated/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
import { findByText } from '../helpers/dom';

let time;

module('Acceptance | bind', function(hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(function() {
    time = new TimeControl();
    time.runAtSpeed(40);
  });
  hooks.afterEach(function() {
    time.finished();
    time = null;
  });

  test('visiting /bind', async function(assert) {
    await visit('/dev/bind');
    assert.equal(currentURL(), '/dev/bind');
  });

  test('clicking the button', async function(assert) {
    let number;

    await visit('/dev/bind');
    number = parseInt(this.element.querySelector('.left-count').textContent);

    await click(findByText(this.element, 'button', '+'));
    let finalNumber = parseInt(this.element.querySelector('.left-count').textContent);
    assert.equal(finalNumber, number + 1);

  });

});
