import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | bind');

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
