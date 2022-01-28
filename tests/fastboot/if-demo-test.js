import { module, test } from 'qunit';
import { setup, visit } from 'ember-cli-fastboot-testing/test-support';

module('Fastboot | if demo', function (hooks) {
  setup(hooks);

  // Uncomment once deprecation is removed or at least does not fail the test
  // https://github.com/ember-fastboot/ember-cli-fastboot/issues/869
  test.todo('it renders the correct h1 title', async function (assert) {
    const { url } = await visit('demos/ifdemo');

    assert.strictEqual(url, 'demos/ifdemo');
    assert.dom('.message').doesNotExist();
  });
});
