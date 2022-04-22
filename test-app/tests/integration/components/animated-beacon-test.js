import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { animationsSettled, bounds } from 'ember-animated/test-support';

module('Integration | Component | animated-beacon', function (hooks) {
  setupRenderingTest(hooks);

  test('beacons are available in transitions', async function (assert) {
    assert.expect(1);
    this.set('transition', function* ({ beacons }) {
      assert.ok(beacons.thegroup, 'expected one beacon');
    });

    await render(hbs`
{{#animated-beacon name="thegroup"}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value this.showIt use=this.transition }}
  <div class="beta"></div>
{{/animated-value}}
`);

    this.set('showIt', true);
    await settled();
    await animationsSettled();
  });

  test('beacons are available in transitions when multiple animated components are present', async function (assert) {
    assert.expect(2);
    this.set('transition1', function* ({ beacons }) {
      assert.ok(beacons.thegroup, '1st transition expected a beacon');
    });

    this.set('transition2', function* ({ beacons }) {
      assert.ok(beacons.thegroup, '2nd transition expected a beacon');
    });

    await render(hbs`
{{#animated-beacon name="thegroup"}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value this.showIt use=this.transition1 }}
  <div class="beta"></div>
{{/animated-value}}
{{#animated-value this.showIt use=this.transition2 }}
  <div class="theta"></div>
{{/animated-value}}
`);

    this.set('showIt', true);
    await settled();
    await animationsSettled();
  });

  test('it picks up correct bounds', async function (assert) {
    assert.expect(4);

    let alpha;

    this.set('transition', function* ({ insertedSprites, beacons }) {
      let sprite = insertedSprites[0];
      sprite.startAtSprite(beacons.thegroup);
      let value = bounds(sprite.element);
      let expected = bounds(alpha);

      // we should be positioned over the beacon
      assert.strictEqual(value.top, expected.top, 'top');
      assert.strictEqual(value.left, expected.left, 'left');

      // and our initialBounds dimensions match the beacon's
      // dimensions (the sprite's element physically does not -- it's
      // up to a motion like scale to decide to do that when it's
      // wanted)
      assert.strictEqual(
        beacons.thegroup.initialBounds.width,
        expected.width,
        'width',
      );
      assert.strictEqual(
        beacons.thegroup.initialBounds.height,
        expected.height,
        'height',
      );
    });

    await render(hbs`
<style>
  .alpha {
    display: inline-block;
    height: 11px;
    width: 10px;
  }
</style>

{{#animated-beacon name="thegroup"}}
  <div class="alpha"></div>
{{/animated-beacon}}

{{#animated-value this.showIt use=this.transition}}
  <div class="beta"></div>
{{/animated-value}}
`);

    alpha = find('.alpha');
    this.set('showIt', true);
    await settled();
    await animationsSettled();
  });
});
