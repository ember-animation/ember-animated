import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | animated if', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders when true', async function(assert) {
    this.set('x', true);
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.equal(this.$('.truthy').length, 1);
  });

  test('it does not render when false', async function(assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.equal(this.$('.truthy').length, 0);
  });

  test('it renders inverse block when false', async function(assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{else}}
        <div class="falsey"></div>
      {{/animated-if}}
    `);
    assert.equal(this.$('.falsey').length, 1);
  });
});