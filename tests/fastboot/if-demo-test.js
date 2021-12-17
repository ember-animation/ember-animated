import { module, test } from 'qunit';
import { setup, visit } from 'ember-cli-fastboot-testing/test-support';

module('Fastboot | if demo', function (hooks) {
  setup(hooks);

  test('it renders the correct h1 title', async function (assert) {
    const { url } = await visit('demos/ifdemo');

    assert.strictEqual(url, 'demos/ifdemo');
    assert.dom('.message').doesNotExist();
  });
});
