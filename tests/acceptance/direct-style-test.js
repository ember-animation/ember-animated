import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | direct style');

test('visiting /direct-style', function(assert) {
  visit('/direct-style');

  andThen(function() {
    assert.equal(currentURL(), '/direct-style');
  });
});
