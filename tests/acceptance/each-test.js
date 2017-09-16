import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | each');

test('visiting /each', function(assert) {
  visit('/each');

  andThen(function() {
    assert.equal(currentURL(), '/each');
  });
});
