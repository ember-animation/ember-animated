import { test, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { click } from '@ember/test-helpers';
import { time, setupAnimationTest, bounds } from 'ember-animated/test-support';

module('Integration | Between Two Lists Example', function(hooks){
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  test('it renders', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);
    assert.ok(this.element.querySelectorAll('bounce'), "found undo button");
  });

  test('Both Lists Have 5 People', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);
    await time.pause();
    let going = this.element.querySelectorAll('.left > .each-item');
    let notGoing = this.element.querySelectorAll('.right > .each-item');
    assert.equal(going.length, notGoing.length, "Both lists have 5 people at first render");
  });

  test('Dwight Moved from Going to Not Going', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);

    await time.pause();
    await click(this.element.querySelector('.left > .each-item > button'));
    await time.advance(2000);
    let going = this.element.querySelectorAll('.left > .each-item');
    let notGoing = this.element.querySelectorAll('.right > .each-item');
    assert.equal(going.length, 4, "Dwight was removed from going list");
    assert.equal(notGoing.length, 6, "Dwight was added to Not Going list");
  });

  test('Move First person in Not Going to Going', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);

    await time.pause();
    await click(this.element.querySelector('.right > .each-item > button'));
    await time.advance(2000);
    let notGoing = this.element.querySelectorAll('.right > .each-item');
    let going = this.element.querySelectorAll('.left > .each-item');
    assert.equal(going.length, 6, "Removed from going list");
    assert.equal(notGoing.length, 4, "Added to Not Going list");
  });

  test('Dwight Moved from Going to Not Going Bounds', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);

    await time.pause();
    let going = this.element.querySelectorAll('.left > .each-item');
    await click(this.element.querySelector('.left > .each-item > button'));
    await time.advance(1000);
    assert.ok(bounds(going[0]).right > bounds(going[1]).right, "Dwight moving away from going list");
  });

  test('Bounce Back Feature Works', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);
    await time.pause();
    await click(this.element.querySelector('.bounce'));
    let going = this.element.querySelectorAll('.left > .each-item');
    await click(this.element.querySelector('.left > .each-item > button'));
    await time.advance(1000);
    assert.ok(bounds(going[0]).right > bounds(going[1]).right, "Dwight moving away from going list");
    await time.advance(1000);
    assert.equal(going.length, 5, "Dwight Returned to Going List");


  });

  test('transitions get logged to screen', async function(assert) {
    await this.render(hbs`
      {{#full-log-table as |fullLog|}}
        {{logged-two-lists fullLog=fullLog}}
      {{/full-log-table}}
    `);

    await click(this.element.querySelector('.left > .each-item > button'));
    let rows = this.element.querySelectorAll('.transition-log-table tr');
    assert.equal(rows.length, 4, "should have two log entries (first two rows are headers)");
    let columns = rows[2].querySelectorAll('td');
    assert.equal(loggedWords(columns[0]).length, 4, "Four Kept People");
    assert.equal(loggedWords(columns[1]).length, 1, "One Sent Person");
    assert.equal(loggedWords(columns[2]).length, 0, "No Received People");

    let column2 = rows[3].querySelectorAll('td');
    assert.equal(loggedWords(column2[0]).length, 5, "Five Kept People");
    assert.equal(loggedWords(column2[1]).length, 0, "No Sent People");
    assert.equal(loggedWords(column2[2]).length, 1, "One Received Person");
  });



});

function loggedWords(tdElement) {
  return tdElement.textContent.trim().split(',').filter(Boolean);
}
