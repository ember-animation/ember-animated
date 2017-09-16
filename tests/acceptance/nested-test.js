import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | nested');

test('visiting /nested', function(assert) {
  visit('/nested');

  andThen(function() {
    assert.equal(currentURL(), '/nested');
  });
});
