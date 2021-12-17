import { test, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Between Two Lists Example', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`{{between-two-lists-example}}`);

    assert.dom('.bounce').exists({ count: 1 }, 'found undo button');
  });
});
