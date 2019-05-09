import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import {
  animationsSettled,
  time,
  setupAnimationTest,
  bounds
} from 'ember-animated/test-support';

module('Integration | Component | demo3', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{index/demo-3}}`);
    let categories = this.element.querySelectorAll('[data-test-category]');
    assert.equal(categories.length, 3, 'categories');
    assert.equal(categories[0].querySelectorAll('[data-test-small-image]').length, 0, 'no small images in active category');
    assert.equal(categories[1].querySelectorAll('[data-test-small-image]').length, 3, 'three small images in non-active category');
    assert.equal(this.element.querySelectorAll('[data-test-large-image]').length, 3, 'three large images');
  });

  test('leaving images animate smoothly', async function(assert) {
    await render(hbs`{{index/demo-3}}`);
    time.pause();
    let categories = this.element.querySelectorAll('[data-test-category]');
    let firstBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);

    await click(categories[1]);
    await time.advance(10);

    let secondBounds = [...categories[0].querySelectorAll('[data-test-small-image]')].map(bounds);
    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, firstBounds[i], secondBounds[i], `leaving image ${i} should be near its starting place`);
    }

    // the animation takes 500ms, so this is "almost done"
    await time.advance(490);
    let thirdBounds = [...categories[0].querySelectorAll('[data-test-small-image]')].map(bounds);

    time.runAtSpeed(40);
    await animationsSettled();

    let fourthBounds = [...categories[0].querySelectorAll('[data-test-small-image]')].map(bounds);
    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, thirdBounds[i], fourthBounds[i], `leaving image ${i} should animate to near its final place`);
    }
  });

  test('entering images animate smoothly', async function(assert) {
    await render(hbs`{{index/demo-3}}`);
    time.pause();
    let categories = this.element.querySelectorAll('[data-test-category]');
    let firstBounds = [...categories[1].querySelectorAll('[data-test-small-image]')].map(bounds);

    await click(categories[1]);
    await time.advance(1);

    let secondBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);
    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, firstBounds[i], secondBounds[i], `entering image ${i} should be near its starting place`);
    }

    // the animation takes 500ms, so this is "almost done"
    await time.advance(490);
    let thirdBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);

    time.runAtSpeed(40);
    await animationsSettled();

    let fourthBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);
    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, thirdBounds[i], fourthBounds[i], `entering image ${i} should animate to near its final place`);
    }
  });

  test('first to second to first interruption goes smoothly', async function(assert) {
    await render(hbs`{{index/demo-3}}`);
    time.pause();
    let categories = this.element.querySelectorAll('[data-test-category]');

    await click(categories[1]);
    await time.advance(250); // half way through animation

    // these are the small first category images that are animating upward to their pile
    let beforeFirstCategoryBounds = [...categories[0].querySelectorAll('[data-test-small-image]')].map(bounds);

    // these are the large second category images that are animating down to the main area
    let beforeSecondCategoryBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);

    // interrupt!
    await click(categories[0]);
    await time.advance(1); // let the animation go just a little bit

    // these are the large first category images that are now animating back downward to the main area
    let afterFirstCategoryBounds = [...this.element.querySelectorAll('[data-test-large-image]')].map(bounds);

    // these are the small second category images that are now animating back upward to their pile
    let afterSecondCategoryBounds = [...categories[1].querySelectorAll('[data-test-small-image]')].map(bounds);

    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, beforeFirstCategoryBounds[i], afterFirstCategoryBounds[i], `first category image ${i} should not jump at interruption`);
    }

    for (let i = 0; i < 3; i++) {
      assert.closeBounds(5, beforeSecondCategoryBounds[i], afterSecondCategoryBounds[i], `second category image ${i} should not jump at interruption`);
    }
  });


});
