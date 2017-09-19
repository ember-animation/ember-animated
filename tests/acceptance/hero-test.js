import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { TimeControl } from 'ember-animated/test-helpers';

let time;
moduleForAcceptance('Acceptance | hero', {
  beforeEach() {
    time = new TimeControl();
    time.runAtSpeed(40);
  },
  afterEach() {
    time.finished();
    time = null;
  }
});

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
