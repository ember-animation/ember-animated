import { test, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Between Two Lists Example', function(hooks){
  setupRenderingTest(hooks);
  test('it renders', async function(assert) {
    await this.render(hbs`
    {{between-two-lists-example}}
    `);
    assert.equal(this.element.querySelectorAll('.bounce').length, 1, "found undo button");
  });
});
