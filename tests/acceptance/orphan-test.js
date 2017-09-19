import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { TimeControl } from 'ember-animated/test-helpers';

let time;

moduleForAcceptance('Acceptance | orphan', {
  beforeEach() {
    time = new TimeControl();
    time.runAtSpeed(40);
  },
  afterEach() {
    time.finished();
    time = null;
  }
});

test('visiting /orphan', function(assert) {
  visit('/orphan');

  andThen(function() {
    assert.equal(currentURL(), '/orphan');
  });
});
