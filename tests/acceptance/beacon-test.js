import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { bounds, setupAnimationTest, time, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | beacon', function(hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test('visiting /beacon', async function(assert) {
    await visit('/beacon');
    assert.equal(currentURL(), '/beacon');
  });

  test('opening modal begins near button', async function(assert) {
    await visit('/beacon');
    time.pause();
    await click(this.element.querySelector('button'));
    await time.advance(10);
    let modal = bounds(this.element.querySelector('.scenario-beacon-modal'));
    let button = bounds(this.element.querySelector('button'));
    assert.closeBounds(5, modal, button, 'modal should be near button');
  });

  test('closing modal ends near button', async function(assert) {
    await visit('/beacon');
    await click(this.element.querySelector('button'));
    await animationsSettled();

    time.pause();
    await click(this.element.querySelector('.scenario-beacon-modal'));
    await time.advance(490); // the demo uses duration 500, so this is nearly done

    let modal = bounds(this.element.querySelector('.scenario-beacon-modal'));
    let button = bounds(this.element.querySelector('button'));
    assert.closeBounds(5, modal, button, 'modal should be near button');
  });


});
