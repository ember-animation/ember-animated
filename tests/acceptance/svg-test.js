import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { TimeControl, animationsSettled, bounds } from 'ember-animated/test-support';

module('Acceptance | svg', function(hooks) {
  setupApplicationTest(hooks);

  let time;

  hooks.beforeEach(function(assert) {
    assert.allClose = function(pixels, firstBoundSet, secondBoundSet) {
      for (let [id, firstBound] of Object.entries(firstBoundSet)) {
        let secondBound = secondBoundSet[id];
        assert.ok(secondBound, `found no matching bound for id=${id}`);
        for (let field of ['top', 'left', 'width', 'height']) {
          assert.ok(
            Math.abs(firstBound[field] - secondBound[field]) < pixels,
            `on id ${id}, ${field} differs by less than ${pixels}. ${firstBound[field]} ~ ${secondBound[field]}`
          );
        }
      }
    };
  });

  hooks.afterEach(function() {
    if (time) {
      time.finished();
      time = null;
    }
  });

  test('visiting /svg', async function(assert) {
    await visit('/svg');
    assert.equal(currentURL(), '/svg');
  });

  test('bubbles move smoothly at start of animation', async function(assert) {
    await visit('/svg');
    let initialBounds = boundsById(this.element.querySelectorAll('circle'));
    time = new TimeControl();
    await click(this.element.querySelector('button'));
    await time.advance(10);
    assert.allClose(5, initialBounds, boundsById(this.element.querySelectorAll('circle')));
  });

  test('bubbles move smoothly at end of animation', async function(assert) {
    await visit('/svg');
    time = new TimeControl();
    await click(this.element.querySelector('button'));
    await time.advance(990);
    let initialBounds = boundsById(this.element.querySelectorAll('circle'));
    await time.advance(20);
    await animationsSettled();
    assert.allClose(5, initialBounds, boundsById(this.element.querySelectorAll('circle')));
  });
});

function boundsById(elementList) {
  let output = {};
  for (let element of [...elementList]) {
    output[element.id] = bounds(element);
  }
  return output;
}
