import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | container only');

test('visiting /container-only', function(assert) {
  visit('/container-only');

  andThen(function() {
    assert.equal(currentURL(), '/container-only');
  });
});
