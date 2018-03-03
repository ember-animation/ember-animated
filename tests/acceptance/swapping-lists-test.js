import { test, module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { TimeControl, animationsSettled } from 'ember-animated/test-support';

module('Acceptance | swapping lists', function(hooks){
  setupApplicationTest(hooks);

  let time;
  hooks.beforeEach(function() {
    time = new TimeControl();
  });
  hooks.afterEach(function() {
    time.finished();
    time = null;
  });

  test('visiting /swapping-lists', async function(assert) {
    await visit('/swapping-lists');
    assert.equal(currentURL(), '/swapping-lists');
  });

  test('toggling with animated receiving side', async function(assert) {
    await visit('/swapping-lists');
    click(this.element.querySelector('button'));
    await time.advance(100);
    let listPosition = this.element.querySelector('.right').getBoundingClientRect().left;
    let leftwardCount = 0;
    [...this.element.querySelectorAll('.right > div')].forEach(element => {
      if (element.getBoundingClientRect().left < listPosition) {
        leftwardCount++;
      }
    });
    assert.ok(leftwardCount >= 3, `expected at least 3 elements to be in motion, found ${leftwardCount}`);
    time.runAtSpeed(60);
    await animationsSettled();
  });

  test('toggling with animated sending side', async function(assert) {
    await visit('/swapping-lists');
    await click(this.element.querySelector('.sending-side > input'));
    click(this.element.querySelector('button'));
    await time.advance(100);

    let hidden = this.element.querySelectorAll('.right > div.ember-animated-hidden').length;
    assert.ok(hidden >= 3, `expected at least 3 elements in right list to be hidden, found ${hidden}`);
    assert.ok(hidden < 10, `expected at least one element in right list to be visible, found ${10-hidden}`);

    let orphans = this.element.querySelectorAll('.animated-orphans > div').length;
    assert.ok(orphans >= 3, `expected at least 3 orphan elements to be in motion, found ${orphans}`);

    time.runAtSpeed(60);
    await animationsSettled();
  });
});
