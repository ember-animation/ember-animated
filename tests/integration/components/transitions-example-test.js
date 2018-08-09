import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { time, setupAnimationTest, bounds } from 'ember-animated/test-support';

module('Integration | Component | transitions-example', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{transitions-example}}`);
    assert.ok(this.element.querySelector('input[type="checkbox"]'));

  });

  test('Message Slides In and Out', async function(assert) {
    await render(hbs`{{transitions-example}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    assert.ok(this.element.querySelector('.message'));

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    assert.notOk(this.element.querySelector('.message'));
  });

  test('Interruption Case', async function(assert) {
    await render(hbs`{{transitions-example}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    let initialBounds = bounds(this.element.querySelector('.message'));

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(500);
    let middleBounds = bounds(this.element.querySelector('.message'));

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    let finalBounds = bounds(this.element.querySelector('.message'));
    assert.deepEqual(initialBounds, finalBounds, "Message started and ended in the same place");
    assert.notEqual(middleBounds, finalBounds, "Message was interrupted during transition");
  });

});
