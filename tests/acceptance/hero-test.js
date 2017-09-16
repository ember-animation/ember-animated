import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | hero');

test('visiting /hero', function(assert) {
  visit('/hero');
  andThen(function() {
    assert.equal(currentURL(), '/hero');
  });
});

test('visiting /hero/1', function(assert) {
  visit('/hero/1');
  andThen(function() {
    assert.equal(currentURL(), '/hero/1');
  });
});
