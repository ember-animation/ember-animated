import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | inline text');

test('visiting /inline-text', function(assert) {
  visit('/inline-text');

  andThen(function() {
    assert.equal(currentURL(), '/inline-text');
  });
});
