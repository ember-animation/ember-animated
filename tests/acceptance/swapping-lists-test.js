import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | swapping lists');

test('visiting /swapping-lists', function(assert) {
  visit('/swapping-lists');

  andThen(function() {
    assert.equal(currentURL(), '/swapping-lists');
  });
});
