import { test, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { time, setupAnimationTest, bounds } from 'ember-animated/test-support';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Sprites Example', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
    {{sprites-example}}
    `);
    assert.strictEqual(
      this.element.querySelectorAll('.top-bar > button').length,
      2,
      'found two buttons',
    );
  });

  test('adding an email', async function (assert) {
    await render(hbs`
    {{sprites-example}}
    `);
    await time.pause();
    await click(this.element.querySelector('.top-bar > button'));
    let emails = this.element.querySelectorAll('.each-item');
    assert.ok(
      bounds(emails[0]).left > bounds(emails[1]).left,
      'first email to the right of the others at start of animation',
    );
  });

  test('deleting an email', async function (assert) {
    await render(hbs`
    {{sprites-example}}
    `);
    let emails = this.element.querySelectorAll('.each-item');
    await click(emails[0].querySelector('input[type="checkbox"]'));
    await time.pause();
    await click(this.element.querySelectorAll('.top-bar > button')[1]);
    await time.advance(50);
    assert.ok(
      bounds(emails[0]).left > bounds(emails[1]).left,
      'first email to the right of the others at start of animation',
    );
  });

  test('transitions get logged to screen', async function (assert) {
    await render(hbs`
      {{#transition-log-table as |logTransition|}}
        {{logged-sprites logTransition=logTransition}}
      {{/transition-log-table}}
    `);

    await click(this.element.querySelector('.top-bar > button'));
    let rows = this.element.querySelectorAll('.transition-log-table tr');
    assert.strictEqual(
      rows.length,
      3,
      'should have one log entry (first two rows are headers)',
    );
    let columns = rows[2].querySelectorAll('td');
    assert.strictEqual(loggedWords(columns[0]).length, 1, 'One inserted word');
    assert.strictEqual(loggedWords(columns[1]).length, 7, 'Seven kept words');
    assert.strictEqual(loggedWords(columns[2]).length, 0, 'No removed words');
  });
});

function loggedWords(tdElement) {
  return tdElement.textContent.trim().split(',').filter(Boolean);
}
