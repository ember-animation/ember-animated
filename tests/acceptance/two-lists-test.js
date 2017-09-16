import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | two lists');

test('visiting /two-lists', function(assert) {
  visit('/two-lists');

  andThen(function() {
    assert.equal(currentURL(), '/two-lists');
  });
});
