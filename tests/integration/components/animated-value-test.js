import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | animated bind', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('value', 'hello');
    await render(hbs`
      {{#animated-value value as |v|}}
        <span>{{v}}</span>
      {{/animated-value}}
    `);

    assert.equal(this.$('span').text().trim(), 'hello');
  });
});
