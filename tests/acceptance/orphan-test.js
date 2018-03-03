import { test, module } from 'qunit';
import { TimeControl, animationsSettled } from 'ember-animated/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';

let time;

module('Acceptance | orphan', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    time = new TimeControl();
    time.runAtSpeed(40);
  });

  hooks.afterEach(function() {
    time.finished();
    time = null;
  });

  test('visiting /orphan', async function(assert) {
    time.pause();
    await visit('/orphan');
    await time.advance(1000);

    let opacity = parseFloat(getComputedStyle(this.element.querySelector('.one')).opacity);
    assert.ok(opacity > 0 && opacity < 1, `expected opacity to be animating, it's ${opacity}`);

    let onePosition = this.element.querySelector('.one').getBoundingClientRect().left;
    let twoPosition = this.element.querySelector('.two').getBoundingClientRect().left;
    assert.ok(twoPosition > onePosition, `expected element .two to be animating in, ${twoPosition } > ${onePosition}`);
    time.runAtSpeed(40);
    await animationsSettled();
    assert.equal(currentURL(), '/orphan');
  });
});
