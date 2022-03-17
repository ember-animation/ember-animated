import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | animated if', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders when true', async function (assert) {
    this.set('x', true);
    await render(hbs`
      {{#animated-if this.x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.dom('.truthy').exists();
  });

  test('it does not render when false', async function (assert) {
    await render(hbs`
      {{#animated-if this.x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.dom('.truthy').doesNotExist();
  });

  test('it renders inverse block when false', async function (assert) {
    await render(hbs`
      {{#animated-if this.x}}
        <div class="truthy"></div>
      {{else}}
        <div class="falsey"></div>
      {{/animated-if}}
    `);
    assert.dom('.falsey').exists();
  });
});
