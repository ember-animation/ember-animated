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

  test('Font Size, Color, and Letter Spacing Change From Initial to Final Values', async function(assert) {
    await render(hbs`{{moving-word-text}}`);

    await time.pause();
    let initialFontSize = parseFloat(getComputedStyle(this.element.querySelector('p')).fontSize);
    let initialLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('p')).letterSpacing);
    assert.equal(this.element.querySelector('p').getAttribute('style'), 'color: lightblue; font-size: 20px; letter-spacing: 0.2rem;', 'starts as lightblue');



    await click(this.element.querySelector('button'));
    await time.advance(2000);
    let finalFontSize = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).fontSize);
    let finalLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).letterSpacing);
    assert.notEqual(initialFontSize, finalFontSize, "Initial and Final Font Size are Different");
    assert.notEqual(initialLetterSpacing, finalLetterSpacing, "Initial and Final Letter Spacing are Different");
    assert.notOk(this.element.querySelector('ul > li').getAttribute('style'));



  });

  test('Attributes transition smoothly from Initial to Final Values', async function(assert) {
    await render(hbs`{{moving-word-text}}`);
    await time.pause();
    let initialFontSize = parseFloat(getComputedStyle(this.element.querySelector('p')).fontSize);
    let initialLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('p')).letterSpacing);
    assert.equal(initialFontSize, 20);
    assert.equal(this.element.querySelector('p').getAttribute('style'), 'color: lightblue; font-size: 20px; letter-spacing: 0.2rem;', 'starts as lightblue');


    await click(this.element.querySelector('button'));
    await time.advance(200);
    await time.pause();
    let middleFontSize = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).fontSize);
    let middleLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).letterSpacing);
    assert.notDeepEqual(initialFontSize, middleFontSize, "Font Size changes");
    assert.notEqual(initialLetterSpacing, middleLetterSpacing, "Letter Spacing changes");
    assert.notOk(this.element.querySelector('ul > li').getAttribute('style'));

    await time.advance(2000);
    await time.pause();
    let finalFontSize = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).fontSize);
    let finalLetterSpacing = parseFloat(getComputedStyle(this.element.querySelector('ul > li')).letterSpacing);
    assert.equal(finalFontSize, 16);
    assert.notEqual(middleLetterSpacing, finalLetterSpacing, "Middle and Final Letter Spacing are Different");
    assert.notOk(this.element.querySelector('ul > li').getAttribute('style'));
  });


});
