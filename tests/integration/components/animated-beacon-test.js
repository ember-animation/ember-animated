import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { animationsSettled, bounds } from 'ember-animated/test-support';

module('Integration | Component | animated-beacon', function(hooks) {
  setupRenderingTest(hooks);

  test('it can match using specific group', async function(assert) {
    assert.expect(1);
    this.set('transition', function * ({ receivedSprites }) {
      assert.equal(receivedSprites.length, 1, 'expected one received sprite');
    });

    await render(hbs`
{{#animated-beacon group="the-group"}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value showIt use=transition group="the-group"}}
  <div class="beta"></div>
{{/animated-value}}
`);

    this.set('showIt', true);
    await settled();
    await animationsSettled();
  });

  test('it can match using default group', async function(assert) {
    assert.expect(1);
    this.set('transition', function * ({ receivedSprites }) {
      assert.equal(receivedSprites.length, 1, 'expected one received sprite');
    });

    await render(hbs`
{{#animated-beacon}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value showIt use=transition }}
  <div class="beta"></div>
{{/animated-value}}
`);

    this.set('showIt', true);
    await settled();
    await animationsSettled();

  });

  test('it picks up correct bounds', async function(assert) {
    assert.expect(4);

    let alpha;

    this.set('transition', function * ({ receivedSprites }) {
      let value = bounds(receivedSprites[0].element);
      let expected = bounds(alpha);

      // we should be positioned over the beacon
      assert.equal(value.top, expected.top, 'top');
      assert.equal(value.left, expected.left, 'left');

      // and our initialBounds dimensions match the beacon's
      // dimensions (the sprite's element physically does not -- it's
      // up to a motion like scale to decide to do that when it's
      // wanted)
      assert.equal(receivedSprites[0].initialBounds.width, expected.width, 'width');
      assert.equal(receivedSprites[0].initialBounds.height, expected.height, 'height');
    });

    await render(hbs`
<style>
  .alpha {
    display: inline-block;
    height: 11px;
    width: 10px;
  }
</style>

{{#animated-beacon group="the-group"}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value showIt use=transition group="the-group"}}
  <div class="beta"></div>
{{/animated-value}}
`);

    alpha = this.element.querySelector('.alpha');
    this.set('showIt', true);
    await settled();
    await animationsSettled();
  });


});
