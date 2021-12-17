import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | animated if', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders when true', async function (assert) {
    this.set('x', true);
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.ok(this.element.querySelector('.truthy'));
  });

  test('it does not render when false', async function (assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.notOk(this.element.querySelector('.truthy'));
  });

  test('it renders inverse block when false', async function (assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{else}}
        <div class="falsey"></div>
      {{/animated-if}}
    `);
    assert.ok(this.element.querySelector('.falsey'));
  });
});
