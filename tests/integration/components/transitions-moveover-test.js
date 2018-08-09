import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { time, setupAnimationTest } from 'ember-animated/test-support';

module('Integration | Component | transitions-moveover', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{transitions-moveover}}`);
    assert.ok(this.element.querySelector('input[type="checkbox"]'));
  });

  test('Show Hello', async function(assert) {
    await render(hbs`{{transitions-moveover}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    assert.ok(this.element.querySelector('.hello'));

  });

  test('Show Goodbye', async function(assert) {
    await render(hbs`{{transitions-moveover}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    assert.ok(this.element.querySelector('.hello'));
    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    assert.ok(this.element.querySelector('.goodbye'));
  });
});
