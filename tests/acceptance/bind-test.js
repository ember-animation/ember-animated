import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | bind');

test('visiting /bind', function(assert) {
  visit('/bind');

  andThen(function() {
    assert.equal(currentURL(), '/bind');
  });
});
