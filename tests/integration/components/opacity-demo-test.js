import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { time, setupAnimationTest } from 'ember-animated/test-support';

module('Integration | Component | opacity-demo', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{opacity-demo}}`);
    assert.ok(this.element.querySelector('input[type="checkbox"]'));
  });


  test('Message Fades In', async function(assert) {
    await render(hbs`{{opacity-demo}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(500);

    let opacity = parseFloat(getComputedStyle(this.element.querySelector('.message')).opacity);
    assert.ok(opacity > 0 && opacity < 1, `expected opacity to be animating, it's ${opacity}`);

    await time.advance(1500);
    let finalOpacity = parseFloat(getComputedStyle(this.element.querySelector('.message')).opacity);
    assert.equal(finalOpacity, 1, `expected opacity to be animating, it's ${opacity}`);

  });

  test('Message Fades Out', async function(assert) {
    await render(hbs`{{opacity-demo}}`);

    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(2000);
    let initialOpacity = parseFloat(getComputedStyle(this.element.querySelector('.message')).opacity);
    assert.equal(initialOpacity, 1);
    await click(this.element.querySelector('input[type="checkbox"]'));
    await time.advance(500);
    let finalOpacity = parseFloat(getComputedStyle(this.element.querySelector('.message')).opacity);
    assert.ok(finalOpacity < initialOpacity, `expected opacity to be animating, it's ${finalOpacity}`);
  });

});
