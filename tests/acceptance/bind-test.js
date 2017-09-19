import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { TimeControl } from 'ember-animated/test-helpers';

let time;

moduleForAcceptance('Acceptance | bind', {
  beforeEach() {
    time = new TimeControl();
    time.runAtSpeed(40);
  },
  afterEach() {
    time.finished();
    time = null;
  }
});

test('visiting /bind', function(assert) {
  visit('/bind');

  andThen(function() {
    assert.equal(currentURL(), '/bind');
  });
});

test('clicking the button', function(assert) {
  let number;

  visit('/bind');

  andThen(function() {
    number = parseInt(find('.left-count').text().trim());
  });

  click('button:contains("+")');
  andThen(function() {
    let finalNumber = parseInt(find('.left-count').text().trim());
    assert.equal(finalNumber, number + 1);
  });
});
