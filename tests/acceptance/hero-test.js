import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { TimeControl } from 'ember-animated/test-support';
import { equalBounds } from '../helpers/assertions';

const FAST = 40;

let time;
module('Acceptance | hero', function(hooks) {
  setupApplicationTest(hooks);


  hooks.beforeEach(assert => {
    assert.equalBounds = equalBounds;
    time = new TimeControl();
    time.runAtSpeed(FAST);
  });

  hooks.afterEach(() => {
    time.finished();
    time = null;
  });

  test('visiting /hero', async function(assert) {
    await visit('/hero');
    assert.equal(currentURL(), '/hero');
  });

  test('visiting /hero/1', async function(assert) {
    await visit('/hero/1');
    assert.equal(currentURL(), '/hero/1');
  });

  test('index to detail', async function(assert) {
    await visit('/hero');
    await click('.hero-list-image');
    assert.equal(currentURL(), '/hero/0');
  });

  test('detail to index', async function(assert) {
    await visit('/hero/0');
    await click('.hero-detail a');
    assert.equal(currentURL(), '/hero');
  });

  test('index to detail with interruption', async function(assert) {
    await visit('/hero');
    time.pause();
    click('.hero-list-image');
    await time.advance(50);
    let beforeInterruption = document.querySelector('.hero-detail-image').getBoundingClientRect();
    let back = visit('/hero');
    await time.advance(0);
    let afterInterruption = document.querySelector('.hero-detail-image').getBoundingClientRect();
    assert.equalBounds(afterInterruption, beforeInterruption, "visual continuity at interruption")
    time.runAtSpeed(FAST);
    await back;
    assert.equal(currentURL(), '/hero');
  });


});
