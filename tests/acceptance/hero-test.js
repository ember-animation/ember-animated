import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { TimeControl, animationsSettled } from 'ember-animated/test-support';
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
    await visit('/demos/hero');
    assert.equal(currentURL(), '/demos/hero');
  });

  test('visiting /hero/1', async function(assert) {
    await visit('/demos/hero/1');
    assert.equal(currentURL(), '/demos/hero/1');
  });

  test('index to detail', async function(assert) {
    await visit('/demos/hero');
    time.pause();
    await click('.hero-list-image');
    await time.advance(50);
    let orphans = this.element.querySelectorAll(
      '.animated-orphans .hero-list-image',
    ).length;
    let hiddenOrphans = this.element.querySelectorAll(
      '.animated-orphans .hero-list-image.ember-animated-hidden',
    ).length;
    assert.equal(orphans, 8, 'orphans');
    assert.equal(hiddenOrphans, 1, 'hidden orphans');
    time.runAtSpeed(FAST);
    await animationsSettled();
    assert.equal(currentURL(), '/demos/hero/0');
  });

  test('detail to index', async function(assert) {
    await visit('/demos/hero/0');
    time.pause();
    await click('.hero-detail a');
    await time.advance(50);
    let images = this.element.querySelectorAll('.hero-list .hero-list-image')
      .length;
    let hiddenImages = this.element.querySelectorAll(
      '.hero-list .hero-list-image.ember-animated-hidden',
    ).length;
    assert.equal(images, 8, 'images');
    assert.equal(hiddenImages, 1, 'hidden images');
    time.runAtSpeed(FAST);
    await animationsSettled();
    assert.equal(currentURL(), '/demos/hero');
  });

  test('index to detail with interruption', async function(assert) {
    await visit('/demos/hero');
    time.pause();
    await click('.hero-list-image');
    await time.advance(50);
    let beforeInterruption = document
      .querySelector('.hero-detail-image')
      .getBoundingClientRect();
    let back = visit('/demos/hero');
    await time.advance(0);
    let afterInterruption = document
      .querySelector('.hero-detail-image')
      .getBoundingClientRect();
    assert.equalBounds(
      afterInterruption,
      beforeInterruption,
      'visual continuity at interruption',
    );
    time.runAtSpeed(FAST);
    await back;
    assert.equal(currentURL(), '/demos/hero');
  });
});
