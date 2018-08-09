import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { time, setupAnimationTest } from 'ember-animated/test-support';

module('Integration | Component | moving-word-text', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{moving-word-text}}`);
    assert.ok(this.element.querySelector('button'));
  });

  test('Font Size and Letter Spacing Change Smoothly', async function(assert) {
    await render(hbs`{{moving-word-text}}`);

    await time.pause();
    let initialFontSize = parseFloat(getComputedStyle(this.element.querySelector('p')).fontSize);
    let initialLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('p')).letterSpacing);

    await click(this.element.querySelector('button'));


    await time.advance(2000);
    let finalFontSize = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).fontSize);
    let finalLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).letterSpacing);
    assert.notEqual(initialFontSize, finalFontSize, "Initial and Final Font Size are Different");
    assert.notEqual(initialLetterSpacing, finalLetterSpacing, "Initial and Final Letter Spacing are Different");


  });

});
