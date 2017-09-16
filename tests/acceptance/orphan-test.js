import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | orphan');

test('visiting /orphan', function(assert) {
  visit('/orphan');

  andThen(function() {
    assert.equal(currentURL(), '/orphan');
  });
});
