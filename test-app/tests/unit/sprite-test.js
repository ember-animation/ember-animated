import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { ownTransform } from 'ember-animated/-private/transform';
import { shiftedBounds } from 'ember-animated/-private/bounds';
import Sprite from 'ember-animated/-private/sprite';
import { hbs } from 'ember-cli-htmlbars';
import { bounds, setupAnimationTest } from 'ember-animated/test-support';
import { render, settled } from '@ember/test-helpers';
import {
  equalBounds,
  visuallyConstant,
  approxEqualPixels,
} from '../helpers/assertions';

module('Unit | Sprite', function (hooks) {
  let environment,
    offsetParent,
    intermediate,
    target,
    innerContent,
    external,
    priorSibling;

  hooks.beforeEach(function (assert) {
    assert.visuallyConstant = visuallyConstant;
    assert.equalBounds = equalBounds;
    assert.approxEqualPixels = approxEqualPixels;

    let fixture = document.querySelector('#qunit-fixture');
    fixture.innerHTML = `
<div class="environment">
  <div class="offset-parent">
    <div class="sibling"></div>
    <div class="intermediate">
      <div class="target">
        <div class="inner-content"></div>
      </div>
    </div>
    <div class="sibling"></div>
  </div>
  <div class="external-parent">
    <div class="external"></div>
  </div>
</div>
`;
    environment = fixture.querySelector('.environment');
    offsetParent = fixture.querySelector('.offset-parent');
    intermediate = fixture.querySelector('.intermediate');
    target = fixture.querySelector('.target');
    innerContent = fixture.querySelector('.inner-content');
    external = fixture.querySelector('.external');
    priorSibling = fixture.querySelector('.sibling');
    environment.style.width = '600px';
    offsetParent.style.position = 'relative';
    innerContent.style.height = '400px';
    let externalParent = fixture.querySelector('.external-parent');
    (externalParent.style.position = 'absolute'),
      (externalParent.style.left = '500px');
    externalParent.style.top = '500px';
    externalParent.style.width = '500px';
    externalParent.style.height = '500px';
    external.style.height = '100px';

    // These siblings are a necessary part of the test
    // environment. They are preventing offsetParent from collapsing
    // its top and bottom margins together when .target gets
    // absolutely positioned. It's not the responsibility of
    // Sprite to guard its surroundings from moving. In a
    // real app you would use animated-container for that.
    fixture.querySelector('.sibling').style.height = '10px';
  });

  hooks.afterEach(function () {
    document.querySelector('#qunit-fixture').innerHTML = '';
  });

  test('Simple case', function (assert) {
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Scaled ancestor', function (assert) {
    environment.style.transform = 'scale(0.5)';
    environment.style['transform-origin'] = '0 0';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Translated ancestor', function (assert) {
    environment.style.transform = 'translateX(500px) translateY(500px)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Scaled offsetParent', function (assert) {
    offsetParent.style.transform = 'scale(0.5)';
    offsetParent.style['transform-origin'] = '0 0';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Translated ancestor beneath offsetParent', function (assert) {
    intermediate.style.transform = 'translateX(10px)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Translated ancestor with border beneath offsetParent', function (assert) {
    intermediate.style.transform = 'translateX(10px)';
    intermediate.style.border = '1px solid green';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Translated ancestor with margins beneath offsetParent', function (assert) {
    intermediate.style.transform = 'translateX(10px)';
    addMargins(intermediate);
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Translated offsetParent', function (assert) {
    offsetParent.style.transform = 'translateX(500px) translateY(500px)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Target translated', function (assert) {
    target.style.transform = 'translateX(500px) translateY(500px)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Target scaled', function (assert) {
    target.style.transform = 'scale(0.5)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  skip('Target rotated', function (assert) {
    target.style.transform = 'rotate(30deg)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Margins on target', function (assert) {
    addMargins(target);
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Margins on offsetParent', function (assert) {
    addMargins(offsetParent);
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Padding on offsetParent', function (assert) {
    addPadding(offsetParent);
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Border on target', function (assert) {
    target.style.border = '2px solid blue';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('Border on target, border-box mode', function (assert) {
    target.style.border = '2px solid blue';
    target.style.boxSizing = 'border-box';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('No leaked styles', function (assert) {
    let m = sprite(target);
    m.lock();
    m.unlock();
    // some browsers result in empty string and some in undefined
    assert.notOk(target.getAttribute('style'), 'empty style');
  });

  test('Restores original styles', function (assert) {
    target.style.position = 'relative';
    target.style.top = '5px';
    target.style.left = '6px';
    target.style.width = '10px';
    target.style.height = '11px';
    target.style.transform = 'translateX(20px)';
    let m = sprite(target);
    m.lock();
    m.unlock();
    assert.strictEqual(target.style.position, 'relative', 'position');
    assert.strictEqual(target.style.top, '5px', 'top');
    assert.strictEqual(target.style.left, '6px', 'left');
    assert.strictEqual(target.style.width, '10px', 'width');
    assert.strictEqual(target.style.height, '11px', 'height');
    assert.strictEqual(ownTransform(target).tx, 20, 'translateX');
  });

  test('Restores original styles even when two sprites interrupt each other', function (assert) {
    target.style.position = 'relative';
    target.style.top = '5px';
    target.style.left = '6px';
    target.style.width = '10px';
    target.style.height = '11px';
    target.style.transform = 'translateX(20px)';
    let m = sprite(target);
    m.lock();
    let m2 = sprite(target);
    m2.lock();
    m2.unlock();
    assert.strictEqual(target.style.position, 'relative', 'position');
    assert.strictEqual(target.style.top, '5px', 'top');
    assert.strictEqual(target.style.left, '6px', 'left');
    assert.strictEqual(target.style.width, '10px', 'width');
    assert.strictEqual(target.style.height, '11px', 'height');
    assert.strictEqual(ownTransform(target).tx, 20, 'translateX');
  });

  test('User-positioned absolute sprite', function (assert) {
    target.style.position = 'absolute';
    target.style.top = '5px';
    target.style.left = '6px';
    target.style.transform = 'translateX(22px) translateY(23px)';

    let initialBounds = target.getBoundingClientRect();

    let m = sprite(target);
    assert.visuallyConstant(target, () => {
      m.lock();
    });

    target.style.top = '6px';
    target.style.left = '7px';
    target.style.transform = 'translateX(23px) translateY(24px)';

    m.unlock();
    m.measureFinalBounds();

    m.lock();
    assert.equalBounds(
      target.getBoundingClientRect(),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.approxEqualPixels(m.initialBounds.top + 2, m.finalBounds.top, 'top');
    assert.approxEqualPixels(
      m.initialBounds.left + 2,
      m.finalBounds.left,
      'left',
    );
  });

  test('User-positioned absolute sprite, interrupted', function (assert) {
    // initial position
    target.style.position = 'absolute';
    target.style.top = '5px';
    target.style.left = '6px';
    target.style.transform = 'translateX(22px) translateY(23px)';
    let initialBounds = target.getBoundingClientRect();
    let m = sprite(target);
    m.lock();

    // simulates first render
    target.style.top = '6px';
    target.style.left = '7px';
    target.style.transform = 'translateX(23px) translateY(24px)';

    m.unlock();
    m.measureFinalBounds();
    m.lock();

    let m2 = sprite(target);
    m2.lock();

    // simulates second render
    target.style.top = '18px';
    target.style.left = '20px';
    target.style.transform = 'translateX(24px) translateY(25px)';

    m2.unlock();
    m2.measureFinalBounds();
    m2.lock();

    assert.approxEqualPixels(
      m2.initialBounds.top + 15,
      m2.finalBounds.top,
      'top',
    );
    assert.approxEqualPixels(
      m2.initialBounds.left + 16,
      m2.finalBounds.left,
      'left',
    );

    assert.equalBounds(
      target.getBoundingClientRect(),
      initialBounds,
      'locking brings it back into initial position',
    );
  });

  test('User-positioned relative sprite', function (assert) {
    target.style.position = 'relative';
    target.style.top = '5px';
    target.style.left = '6px';

    let initialBounds = target.getBoundingClientRect();

    let m = sprite(target);
    assert.visuallyConstant(target, () => {
      m.lock();
    });

    target.style.top = '6px';
    target.style.left = '7px';

    m.unlock();
    m.measureFinalBounds();

    m.lock();
    assert.equalBounds(
      target.getBoundingClientRect(),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.approxEqualPixels(m.finalBounds.top, m.initialBounds.top + 1, 'top');
    assert.approxEqualPixels(
      m.finalBounds.left,
      m.initialBounds.left + 1,
      'left',
    );
  });

  test('User-positioned relative sprite, interrupted', function (assert) {
    // initial position
    target.style.position = 'relative';
    target.style.top = '5px';
    target.style.left = '6px';
    let initialBounds = target.getBoundingClientRect();
    let m = sprite(target);
    m.lock();

    // simulates first render
    target.style.top = '6px';
    target.style.left = '7px';

    m.unlock();
    m.measureFinalBounds();
    m.lock();

    let m2 = sprite(target);
    m2.lock();

    // simulates second render
    target.style.top = '18px';
    target.style.left = '20px';

    m2.unlock();
    m2.measureFinalBounds();
    m2.lock();

    assert.approxEqualPixels(
      m2.initialBounds.top + 13,
      m2.finalBounds.top,
      'top',
    );
    assert.approxEqualPixels(
      m2.initialBounds.left + 14,
      m2.finalBounds.left,
      'left',
    );

    assert.equalBounds(
      target.getBoundingClientRect(),
      initialBounds,
      'locking brings it back into initial position',
    );
  });

  test('external style mutations persist across unlock: added property that does not collide with our imposed styles', function (assert) {
    let m = sprite(target);
    m.lock();
    target.style.borderWidth = '123px';
    m.unlock();
    assert.strictEqual(target.style.borderWidth, '123px');
  });

  test('external style mutations persist across unlock: changed properties that collide with our imposed styles', function (assert) {
    target.style.top = '3231px';
    target.style.left = '2423px';
    target.style.width = '5453px';
    target.style.height = '6564px';
    target.style.position = 'absolute';
    target.style['box-sizing'] = 'content-box';
    target.style['margin-top'] = '8px';
    let m = sprite(target);
    m.lock();
    target.style.top = '3232px';
    target.style.left = '2424px';
    target.style.width = '5454px';
    target.style.height = '6565px';
    target.style.position = 'fixed';
    target.style.boxSizing = 'border-box';
    target.style['margin-top'] = '9px';
    m.unlock();
    assert.strictEqual(target.style.top, '3232px', 'top');
    assert.strictEqual(target.style.left, '2424px', 'left');
    assert.strictEqual(target.style.width, '5454px', 'width');
    assert.strictEqual(target.style.height, '6565px', 'height');
    assert.strictEqual(target.style.position, 'fixed', 'position');
    assert.strictEqual(target.style['box-sizing'], 'border-box', 'box-sizing');
    assert.strictEqual(target.style['margin-top'], '9px', 'margin');
  });

  test('within scrolling context above offset parent', function (assert) {
    environment.style['overflow-y'] = 'scroll';
    environment.style.height = '400px';
    offsetParent.style['margin-top'] = '200px';
    offsetParent.style.height = '600px';
    environment.scrollTop = 300;
    let m = sprite(target);
    assert.visuallyConstant(target, () => {
      m.lock();
    });
  });

  test('within scrolling offset parent', function (assert) {
    intermediate.style.height = '4000px';
    intermediate.style.width = '200%';
    intermediate.style['padding-top'] = '2000px';
    offsetParent.style.overflow = 'scroll';
    offsetParent.style.height = '100px';
    offsetParent.style.width = '100%';
    offsetParent['scroll-top'] = 2000;
    offsetParent['scroll-left'] = 10;
    let m = sprite(target);
    assert.visuallyConstant(target, () => {
      m.lock();
    });
  });

  test('target absolutely positioned', function (assert) {
    target.style.position = 'absolute';
    target.style.top = '100px';
    target.style.left = '200px';

    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('target absolutely positioned, border on offsetParent', function (assert) {
    target.style.position = 'absolute';
    target.style.top = '100px';
    target.style.left = '200px';
    offsetParent.style.border = '1px solid green';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('target absolutely positioned with transformed ancestor beneath nearest positioned ancestor', function (assert) {
    target.style.position = 'absolute';
    target.style.top = '100px';
    target.style.left = '200px';
    intermediate.style.transform = 'translateX(10px)';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('target absolutely positioned with transformed ancestor with border beneath nearest positioned ancestor', function (assert) {
    target.style.position = 'absolute';
    target.style.top = '100px';
    target.style.left = '200px';
    intermediate.style.transform = 'translateX(10px)';
    intermediate.style.border = '1px solid green';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('target fixed positioned', function (assert) {
    target.style.position = 'fixed';
    target.style.top = '100px';
    target.style.left = '200px';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('static body with margins', function (assert) {
    let body = document.querySelector('body');
    assert.strictEqual(
      getComputedStyle(body).position,
      'static',
      'This test cannot work correctly if the body is not statically positioned',
    );
    body.append(intermediate);
    intermediate.style.margin = '10px';
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('static body with scroll', function (assert) {
    let body = document.querySelector('body');
    assert.strictEqual(
      getComputedStyle(body).position,
      'static',
      'This test cannot work correctly if the body is not statically positioned',
    );
    body.append(intermediate);
    intermediate.style.margin = '10px';
    intermediate.style.height = '200%';
    intermediate.style.width = '200%';
    intermediate.style.paddingTop = '50%';
    window.scrollTo(10, 100);

    assert.strictEqual(
      window.scrollY,
      100,
      'ensure we really scrolled the body',
    );
    assert.strictEqual(
      window.scrollX,
      10,
      'ensure we really scrolled the body',
    );
    let m = sprite(target);
    assert.visuallyConstant(target, () => m.lock());
  });

  test('remembers initial bounds', function (assert) {
    let m = sprite(target);
    assert.approxEqualPixels(
      m.initialBounds.top,
      document.querySelector('.sibling').getBoundingClientRect().height,
      'top relative to parent',
    );
    assert.approxEqualPixels(
      m.initialBounds.left,
      0,
      'left relative to parent',
    );
  });

  test('measures and remembers final bounds', function (assert) {
    let m = sprite(target);
    target.style.transform = 'translateX(100px)';
    m.measureFinalBounds();
    assert.approxEqualPixels(
      m.finalBounds.top,
      m.initialBounds.top,
      'top constant',
    );
    assert.approxEqualPixels(
      m.initialBounds.left + 100,
      m.finalBounds.left,
      'left reflects movement',
    );
  });

  test('requires an initial position sprite to have an initial positioned offset measurement', function (assert) {
    let parent = Sprite.offsetParentEndingAt(target);
    assert.throws(() => {
      Sprite.positionedStartingAt(target, parent);
    }, /must have initial bounds/);
  });

  test('requires a final position sprite to have a final positioned offset measurement', function (assert) {
    let parent = Sprite.offsetParentStartingAt(target);
    assert.throws(() => {
      Sprite.positionedEndingAt(target, parent);
    }, /must have final bounds/);
  });

  test('can initialize in final position', function (assert) {
    let parent = Sprite.offsetParentEndingAt(target);
    let m = Sprite.positionedEndingAt(target, parent);
    assert.approxEqualPixels(
      m.finalBounds.top,
      document.querySelector('.sibling').getBoundingClientRect().height,
      'top relative to parent',
    );
    assert.approxEqualPixels(m.finalBounds.left, 0, 'left relative to parent');
  });

  test('can get current bounds', function (assert) {
    let m = sprite(target);
    target.style.transform = 'translateX(100px) translateY(120px)';
    let b = m.getCurrentBounds();
    assert.approxEqualPixels(
      b.top - 120,
      m.initialBounds.top,
      'top reflects movement',
    );
    assert.approxEqualPixels(
      b.left - 100,
      m.initialBounds.left,
      'left reflects movement',
    );
  });

  test('current bounds are unaffected by parent movement', function (assert) {
    let m = sprite(target);
    offsetParent.style.transform = 'translateX(100px) translateY(120px)';
    let b = m.getCurrentBounds();
    assert.approxEqualPixels(b.top, m.initialBounds.top, 'top constant');
    assert.approxEqualPixels(b.left, m.initialBounds.left, 'left constant');
  });

  test('start translated', function (assert) {
    let parent = makeParent(target);
    parent.measureFinalBounds();
    let m = Sprite.positionedEndingAt(target, parent);
    let bounds = target.getBoundingClientRect();
    m.startAtPixel({ x: 400, y: 300 });
    assert.approxEqualPixels(
      m.finalBounds.left - m.initialBounds.left,
      bounds.left - 400,
      'left',
    );
    assert.approxEqualPixels(
      m.finalBounds.top - m.initialBounds.top,
      bounds.top - 300,
      'top',
    );
    assert.equalBounds(
      m.initialBounds,
      m.getCurrentBounds(),
      'current matches initial',
    );
  });

  test('start translated, accounts for parent motion', function (assert) {
    let parent = makeParent(target);
    offsetParent.style.transform = 'translateX(100px) translateY(120px)';
    parent.measureFinalBounds();

    let m = Sprite.positionedEndingAt(target, parent);
    let bounds = target.getBoundingClientRect();
    m.startAtPixel({ x: 400, y: 300 });

    assert.approxEqualPixels(
      m.finalBounds.left - m.initialBounds.left - 100,
      bounds.left - 400,
      'left',
    );
    assert.approxEqualPixels(
      m.finalBounds.top - m.initialBounds.top - 120,
      bounds.top - 300,
      'top',
    );

    assert.equalBounds(
      m.initialBounds,
      m.getCurrentBounds(),
      'current matches initial',
    );
  });

  test("target's margins collapse with its children", function (assert) {
    innerContent.style.marginTop = '10px';
    innerContent.style.marginBottom = '20px';
    let m = sprite(target);
    assert.visuallyConstant(
      target,
      () => {
        assert.visuallyConstant(
          innerContent,
          () => {
            m.lock();
          },
          'inner content bounds',
        );
      },
      'target bounds',
    );

    assert.visuallyConstant(
      target,
      () => {
        assert.visuallyConstant(
          innerContent,
          () => {
            m.unlock();
          },
          'inner content bounds unlock',
        );
      },
      'target bounds unlock',
    );
  });

  test('target not eligible for margin collapse', function (assert) {
    innerContent.style.marginTop = '10px';
    innerContent.style.marginBottom = '20px';
    target.style.position = 'absolute';
    let m = sprite(target);
    assert.visuallyConstant(
      target,
      () => {
        assert.visuallyConstant(
          innerContent,
          () => {
            m.lock();
          },
          'inner content bounds',
        );
      },
      'target bounds',
    );

    assert.visuallyConstant(
      target,
      () => {
        assert.visuallyConstant(
          innerContent,
          () => {
            m.unlock();
          },
          'inner content bounds unlock',
        );
      },
      'target bounds unlock',
    );
  });

  test('Sprite is sealed in test mode', function (assert) {
    let m = sprite(target);
    assert.throws(() => {
      m.somethingExtra = true;
    });
  });

  test('startAtSprite moves into correct position', function (assert) {
    let externalSprite = Sprite.positionedStartingAt(
      external,
      makeParent(external),
    );

    let parent = makeParent(target);
    parent.measureFinalBounds();

    let m = Sprite.positionedEndingAt(target, parent);
    m.startAtSprite(externalSprite);

    let have = target.getBoundingClientRect();
    let want = external.getBoundingClientRect();
    assert.approxEqualPixels(have.top, want.top, 'vertical position matches');
    assert.approxEqualPixels(
      have.left,
      want.left,
      'horizontal position matches',
    );
  });

  test("startAtSprite matches the source sprite's dimensions", function (assert) {
    let externalSprite = Sprite.positionedStartingAt(
      external,
      makeParent(external),
    );

    let parent = makeParent(target);
    parent.measureFinalBounds();

    let m = Sprite.positionedEndingAt(target, parent);
    m.startAtSprite(externalSprite);

    let want = external.getBoundingClientRect();
    assert.approxEqualPixels(
      m.initialBounds.width,
      want.width,
      'width was recorded',
    );
    assert.approxEqualPixels(
      m.initialBounds.height,
      want.height,
      'height was recorded',
    );
  });

  test("startAtSprite matches the source sprite's opacity", function (assert) {
    external.style.opacity = 0.3;
    let externalSprite = Sprite.positionedStartingAt(
      external,
      makeParent(external),
    );

    let parent = makeParent(target);
    parent.measureFinalBounds();

    let m = Sprite.positionedEndingAt(target, parent);
    m.startAtSprite(externalSprite);

    assert.ok(
      Math.abs(parseFloat(m.initialComputedStyle.opacity) - 0.3) < 0.01,
      'opacity differs by less than 1%',
    );
  });

  test('startAtSprite moves into correct position, even when we already had initialBounds', function (assert) {
    let externalSprite = Sprite.positionedStartingAt(
      external,
      makeParent(external),
    );

    let parent = makeParent(target);
    parent.measureFinalBounds();

    let m = Sprite.positionedStartingAt(target, parent);
    target.style.transform = 'translateX(100px) translateY(120px)';
    m.measureFinalBounds();
    m.lock();
    m.startAtSprite(externalSprite);

    let have = target.getBoundingClientRect();
    let want = external.getBoundingClientRect();
    assert.approxEqualPixels(have.top, want.top, 'vertical position matches');
    assert.approxEqualPixels(
      have.left,
      want.left,
      'horizontal position matches',
    );
  });

  test('moveToFinalPosition moves to correct position', function (assert) {
    let externalSprite = Sprite.positionedStartingAt(
      external,
      makeParent(external),
    );

    let parent = makeParent(target);
    parent.measureFinalBounds();

    let want = target.getBoundingClientRect();
    let m = Sprite.positionedEndingAt(target, parent);
    m.startAtSprite(externalSprite);
    m.moveToFinalPosition();
    let have = target.getBoundingClientRect();
    assert.approxEqualPixels(have.top, want.top, 'vertical position matches');
    assert.approxEqualPixels(
      have.left,
      want.left,
      'horizontal position matches',
    );
  });

  test('rehome', function (assert) {
    // we're going to move the target from being relative to
    // intermediate to being relative to priorSibling
    intermediate.style.position = 'relative';
    priorSibling.style.position = 'relative';

    let parent = makeParent(target);
    parent.measureFinalBounds();
    let m = Sprite.positionedStartingAt(target, parent);

    let destination = makeParent(priorSibling);

    assert.visuallyConstant(
      target,
      () => {
        m.rehome(destination);
        priorSibling.appendChild(target);
        m.lock();
      },
      'target bounds',
    );
  });

  test('rehome a scaled and translated sprite', function (assert) {
    // we're going to move the target from being relative to
    // intermediate to being relative to priorSibling
    intermediate.style.position = 'relative';
    priorSibling.style.position = 'relative';
    target.style.transform = 'translateX(65px) translateY(75px) scale(0.55)';

    let parent = makeParent(target);
    parent.measureFinalBounds();
    let m = Sprite.positionedStartingAt(target, parent);

    let destination = makeParent(priorSibling);

    assert.visuallyConstant(
      target,
      () => {
        m.rehome(destination);
        priorSibling.appendChild(target);
        m.lock();
      },
      'target bounds',
    );
  });

  skip('polyfills WeakMap as needed (and remember to adjust eslint config)', function (assert) {
    assert.ok(false);
  });

  skip('polyfills Map as needed (and remember to adjust eslint config)', function (assert) {
    assert.ok(false);
  });

  skip('polyfills rAF as needed', function (assert) {
    assert.ok(false);
  });

  function makeParent(elt) {
    return Sprite.offsetParentStartingAt(elt);
  }

  function makeSprite(elt, parent) {
    return Sprite.positionedStartingAt(elt, parent);
  }

  function sprite(elt) {
    let parent = makeParent(elt);
    parent.measureFinalBounds();
    return makeSprite(elt, parent);
  }

  function addMargins(elt) {
    elt.style['margin-top'] = '40px';
    elt.style['margin-left'] = '50px';
    elt.style['margin-right'] = '60px';
    elt.style['margin-bottom'] = '70px';
  }

  function addPadding(elt) {
    elt.style['padding-top'] = '8px';
    elt.style['padding-left'] = '9px';
    elt.style['padding-right'] = '10px';
    elt.style['padding-bottom'] = '11px';
  }
});

module('Unit | Sprite (SVG sprite locking support)', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('svg elements can use the top <svg> tag as their offset parent', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <rect class="target" width="40" height="50" x="100" y="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    assert.strictEqual(
      parent.element,
      this.element.querySelector('svg'),
      'the offset parent sprite should be the <svg> element',
    );
  });

  test('svg elements can use a nested <svg> tag as their offset parent', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <svg class="inside">
    <rect class="target" width="40" height="50" x="100" y="200" fill="blue" />
  </svg>
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    assert.strictEqual(
      parent.element,
      this.element.querySelector('.inside'),
      'the offset parent sprite should be the inside <svg> element',
    );
  });

  test('svg elements skip over <g> when finding their offset parent', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <svg class="inside">
    <g>
      <rect class="target" width="40" height="50" x="100" y="200" fill="blue" />
    </g>
  </svg>
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    assert.strictEqual(
      parent.element,
      this.element.querySelector('.inside'),
      'the offset parent sprite should be the inside <svg> element',
    );
  });

  test('SVG rect with manipulated size', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <rect class="target" width="40" height="50" x="100" y="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let initialBounds = bounds(target);

    await assert.visuallyConstant(target, () => {
      sprite.lock();
    });

    target.setAttribute('width', '45');
    target.setAttribute('height', '58');

    sprite.unlock();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    sprite.lock();

    assert.equalBounds(
      bounds(target),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.equalSize(
      {
        width: sprite.initialBounds.width + 5,
        height: sprite.initialBounds.height + 8,
      },
      sprite.finalBounds,
      'measured bounds show the size change',
    );
  });

  test('SVG rect with manipulated x and y', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <rect class="target" width="40" height="50" x="100" y="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let initialBounds = bounds(target);

    await assert.visuallyConstant(target, () => {
      sprite.lock();
    });

    target.setAttribute('x', '120');
    target.setAttribute('y', '190');

    sprite.unlock();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    sprite.lock();

    assert.equalBounds(
      bounds(target),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.equalBounds(
      shiftedBounds(sprite.initialBounds, 20, -10),
      sprite.finalBounds,
      'measured bounds show the position change',
    );
  });

  test('SVG circle with manipulated position', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <circle class="target" r="50" cx="100" cy="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let initialBounds = bounds(target);

    await assert.visuallyConstant(target, () => {
      sprite.lock();
    });

    target.setAttribute('cx', '120');
    target.setAttribute('cy', '190');

    sprite.unlock();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    sprite.lock();

    assert.equalBounds(
      bounds(target),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.equalBounds(
      shiftedBounds(sprite.initialBounds, 20, -10),
      sprite.finalBounds,
      'measured bounds detect the change',
    );
  });

  test('SVG circle with manipulated radius', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <circle class="target" r="50" cx="100" cy="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let initialBounds = bounds(target);

    await assert.visuallyConstant(target, () => {
      sprite.lock();
    });

    target.setAttribute('r', '60');

    sprite.unlock();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    sprite.lock();

    assert.equalBounds(
      bounds(target),
      initialBounds,
      'locking brings it back into initial position',
    );

    assert.equalSize(
      {
        width: sprite.initialBounds.width + 20,
        height: sprite.initialBounds.height + 20,
      },
      sprite.finalBounds,
      'measured bounds detect the change',
    );
  });

  test('can read initial and final SVG dimensions', async function (assert) {
    await render(hbs`
<svg width=1000 height=1000>
  <circle class="target" r="50" cx="100" cy="200" fill="blue" />
</svg>
`);

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    sprite.lock();

    target.setAttribute('cx', '120');

    sprite.unlock();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    assert.strictEqual(sprite.getInitialDimension('cx'), 100, 'cx initial');
    assert.strictEqual(sprite.getFinalDimension('cx'), 120, 'cx final');
  });

  test('rehome a sprite out of a scaled and translated parent', async function (assert) {
    await render(hbs`
      <div class="sibling" style="position: relative"></div>
      <div class="intermediate" style="position: relative; transform: translateX(65px) translateY(75px) scale(0.55)">
        <div class="target">This is some content</div>
      </div>
`);

    // we're going to move the target from being relative to
    // intermediate to being relative to sibling

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let destination = new Sprite(this.element.querySelector('.sibling'), true);

    await assert.visuallyConstant(
      target,
      async () => {
        sprite.rehome(destination);
        destination.element.appendChild(target);
        sprite.lock();
      },
      'target bounds',
    );
  });

  skip('rehome a sprite within a shared scaled and translated context', async function (assert) {
    await render(hbs`
      <div class="environment" style="transform: translateX(65px) translateY(75px) scale(0.55)">
        <div class="sibling" style="position: relative"></div>
        <div class="intermediate" style="position: relative">
          <div class="target">This is some content</div>
       </div>
      </div>
`);

    // we're going to move the target from being relative to
    // intermediate to being relative to sibling

    let target = this.element.querySelector('.target');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    let destination = new Sprite(this.element.querySelector('.sibling'), true);

    await assert.visuallyConstant(
      target,
      async () => {
        sprite.rehome(destination);
        destination.element.appendChild(target);
        sprite.lock();
      },
      'target bounds',
    );
  });

  test('sprites cleanup their classlist', async function (assert) {
    await render(hbs`<div class="a"></div>`);
    let target = this.element.querySelector('.a');

    let parent = Sprite.offsetParentEndingAt(target);
    let sprite = Sprite.positionedEndingAt(target, parent);

    sprite.lock();
    // a class added externally during animation
    target.classList.add('extra');
    sprite.unlock();
    assert.notOk(
      target.classList.contains('extra'),
      'extra should have been cleaned up',
    );
  });

  test('sprites cleanup classlist correctly when there are dynamic classes', async function (assert) {
    await render(hbs`<div class="a {{if this.showB "b"}}"></div>`);

    let target = this.element.querySelector('.a');
    let parent = Sprite.offsetParentStartingAt(target);
    let sprite = Sprite.positionedStartingAt(target, parent);

    this.set('showB', true);
    await settled();

    parent.measureFinalBounds();
    sprite.measureFinalBounds();

    sprite.lock();
    // a class added externally during animation
    target.classList.add('extra');
    sprite.unlock();

    assert.notOk(
      target.classList.contains('extra'),
      'extra should have been cleaned up',
    );
    assert.dom(target).hasClass('b', 'keeps the b class');
  });
});
