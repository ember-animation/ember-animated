import { module, test, skip } from 'qunit';
import { ownTransform } from 'ember-animated/transform';
import Sprite from 'ember-animated/sprite';
import $ from 'jquery';
import {
  equalBounds,
  visuallyConstant,
  approxEqualPixels
} from '../helpers/assertions';

let environment, offsetParent, intermediate, target, innerContent;

module("Unit | Sprite", {
  beforeEach(assert) {
    assert.visuallyConstant = visuallyConstant;
    assert.equalBounds = equalBounds;
    assert.approxEqualPixels = approxEqualPixels;

    let fixture = $('#qunit-fixture');
    fixture.html(`
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
</div>
`);
    environment = fixture.find('.environment');
    offsetParent = fixture.find('.offset-parent');
    intermediate = fixture.find('.intermediate');
    target = fixture.find('.target');
    innerContent = fixture.find('.inner-content');
    environment.width(600);
    offsetParent.css({
      position: 'relative'
    });
    innerContent.height(400);

    // These siblings are a necessary part of the test
    // environment. They are preventing offsetParent from collapsing
    // its top and bottom margins together when .target gets
    // absolutely positioned. It's not the responsibility of
    // Sprite to guard its surroundings from moving. In a
    // real app you would use animated-container for that.
    fixture.find('.sibling').height(10);
  },
  afterEach() {
    $('#qunit-fixture').empty();
  }
});

test('Simple case', function(assert) {
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Scaled ancestor', function(assert) {
  environment.css('transform', 'scale(0.5)');
  environment.css('transform-origin', '0 0');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Translated ancestor', function(assert) {
  environment.css('transform', 'translateX(500px) translateY(500px)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Scaled offsetParent', function(assert) {
  offsetParent.css('transform', 'scale(0.5)');
  offsetParent.css('transform-origin', '0 0');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Translated ancestor beneath offsetParent', function(assert) {
  intermediate.css('transform', 'translateX(10px)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Translated ancestor with border beneath offsetParent', function(assert) {
  intermediate.css('transform', 'translateX(10px)');
  intermediate.css('border', '1px solid green');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Translated ancestor with margins beneath offsetParent', function(assert) {
  intermediate.css('transform', 'translateX(10px)');
  addMargins(intermediate);
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});


test('Translated offsetParent', function(assert) {
  offsetParent.css('transform', 'translateX(500px) translateY(500px)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Target translated', function(assert) {
  target.css('transform', 'translateX(500px) translateY(500px)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Target scaled', function(assert) {
  target.css('transform', 'scale(0.5)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

skip('Target rotated', function(assert) {
  target.css('transform', 'rotate(30deg)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Margins on target', function(assert) {
  addMargins(target);
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Margins on offsetParent', function(assert) {
  addMargins(offsetParent);
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Padding on offsetParent', function(assert) {
  addPadding(offsetParent);
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Border on target', function(assert) {
  target.css('border', '2px solid blue');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test('Border on target, border-box mode', function(assert) {
  target.css({
    border: '2px solid blue',
    'box-sizing': 'border-box'
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("No leaked styles", function(assert) {
  let m = sprite(target);
  m.lock();
  m.unlock();
  // some browsers result in empty string and some in undefined
  assert.ok(!target.attr('style'), 'empty style');
});

test("Restores original styles", function(assert) {
  target.css({
    position: 'relative',
    top: '5px',
    left: '6px',
    width: '10px',
    height: '11px',
    transform: 'translateX(20px)'
  });
  let m = sprite(target);
  m.lock();
  m.unlock();
  assert.equal(target.css('position'), 'relative', 'position');
  assert.equal(target.css('top'), '5px', 'top');
  assert.equal(target.css('left'), '6px', 'left');
  assert.equal(target.css('width'), '10px', 'width');
  assert.equal(target.css('height'), '11px', 'height');
  assert.equal(ownTransform(target[0]).tx, 20, 'translateX');
});

test("Restores original styles even when two sprites interrupt each other", function(assert) {
  target.css({
    position: 'relative',
    top: '5px',
    left: '6px',
    width: '10px',
    height: '11px',
    transform: 'translateX(20px)'
  });
  let m = sprite(target);
  m.lock();
  let m2 = sprite(target);
  m2.lock();
  m2.unlock();
  assert.equal(target.css('position'), 'relative', 'position');
  assert.equal(target.css('top'), '5px', 'top');
  assert.equal(target.css('left'), '6px', 'left');
  assert.equal(target.css('width'), '10px', 'width');
  assert.equal(target.css('height'), '11px', 'height');
  assert.equal(ownTransform(target[0]).tx, 20, 'translateX');
});

test("User-positioned absolute sprite", function(assert) {
  target.css({
    position: 'absolute',
    top: '5px',
    left: '6px',
    transform: 'translateX(22px) translateY(23px)'
  });

  let initialBounds = target[0].getBoundingClientRect();

  let m = sprite(target);
  assert.visuallyConstant(target, () => {
    m.lock();
  });

  target.css({
    top: '6px',
    left: '7px',
    transform: 'translateX(23px) translateY(24px)'
  });

  m.unlock();
  m.measureFinalBounds();

  m.lock();
  assert.equalBounds(
    target[0].getBoundingClientRect(),
    initialBounds,
    'locking brings it back into initial position'
  );

  assert.approxEqualPixels(m.initialBounds.top + 2, m.finalBounds.top, 'top');
  assert.approxEqualPixels(m.initialBounds.left + 2, m.finalBounds.left, 'left');

});

test("User-positioned absolute sprite, interrupted", function(assert) {
  // initial position
  target.css({
    position: 'absolute',
    top: '5px',
    left: '6px',
    transform: 'translateX(22px) translateY(23px)'
  });
  let initialBounds = target[0].getBoundingClientRect();
  let m = sprite(target);
  m.lock();

  // simulates first render
  target.css({
    top: '6px',
    left: '7px',
    transform: 'translateX(23px) translateY(24px)'
  });

  m.unlock();
  m.measureFinalBounds();
  m.lock();

  let m2 = sprite(target);
  m2.lock();

  // simulates second render
  target.css({
    top: '18px',
    left: '20px',
    transform: 'translateX(24px) translateY(25px)'
  });

  m2.unlock();
  m2.measureFinalBounds();
  m2.lock();

  assert.approxEqualPixels(m2.initialBounds.top + 15, m2.finalBounds.top, 'top');
  assert.approxEqualPixels(m2.initialBounds.left + 16, m2.finalBounds.left, 'left');

  assert.equalBounds(
    target[0].getBoundingClientRect(),
    initialBounds,
    'locking brings it back into initial position'
  );

});

test("User-positioned relative sprite", function(assert) {
  target.css({
    position: 'relative',
    top: '5px',
    left: '6px'
  });

  let initialBounds = target[0].getBoundingClientRect();

  let m = sprite(target);
  assert.visuallyConstant(target, () => {
    m.lock();
  });

  target.css({
    top: '6px',
    left: '7px'
  });

  m.unlock();
  m.measureFinalBounds();

  m.lock();
  assert.equalBounds(
    target[0].getBoundingClientRect(),
    initialBounds,
    'locking brings it back into initial position'
  );

  assert.approxEqualPixels(m.finalBounds.top, m.initialBounds.top + 1, 'top');
  assert.approxEqualPixels(m.finalBounds.left, m.initialBounds.left + 1, 'left');

});

test("User-positioned relative sprite, interrupted", function(assert) {
  // initial position
  target.css({
    position: 'relative',
    top: '5px',
    left: '6px'
  });
  let initialBounds = target[0].getBoundingClientRect();
  let m = sprite(target);
  m.lock();

  // simulates first render
  target.css({
    top: '6px',
    left: '7px'
  });

  m.unlock();
  m.measureFinalBounds();
  m.lock();

  let m2 = sprite(target);
  m2.lock();

  // simulates second render
  target.css({
    top: '18px',
    left: '20px'
  });

  m2.unlock();
  m2.measureFinalBounds();
  m2.lock();

  assert.approxEqualPixels(m2.initialBounds.top + 13, m2.finalBounds.top, 'top');
  assert.approxEqualPixels(m2.initialBounds.left + 14, m2.finalBounds.left, 'left');

  assert.equalBounds(
    target[0].getBoundingClientRect(),
    initialBounds,
    'locking brings it back into initial position'
  );

});


test("external style mutations persist across unlock: added property that does not collide with our imposed styles", function(assert) {
  let m = sprite(target);
  m.lock();
  target[0].style.borderWidth = '123px';
  m.unlock();
  assert.equal(target[0].style.borderWidth, '123px');
});

test("external style mutations persist across unlock: changed properties that collide with our imposed styles", function(assert) {
  target.css({
    top: '3231px',
    left: '2423px',
    width: '5453px',
    height: '6564px',
    position: 'absolute',
    'box-sizing': 'content-box',
    marginTop: '8px'
  });
  let m = sprite(target);
  m.lock();
  target.css({
    top: '3232px',
    left: '2424px',
    width: '5454px',
    height: '6565px',
    position: 'fixed',
    'box-sizing': 'border-box',
    marginTop: '9px'
  });
  m.unlock();
  assert.equal(target.css('top'), '3232px', 'top');
  assert.equal(target.css('left'), '2424px', 'left');
  assert.equal(target.css('width'), '5454px', 'width');
  assert.equal(target.css('height'), '6565px', 'height');
  assert.equal(target.css('position'), 'fixed', 'position');
  assert.equal(target.css('box-sizing'), 'border-box', 'box-sizing');
  assert.equal(target.css('marginTop'), '9px', 'margin');
});

test("within scrolling context above offset parent", function(assert) {
  environment.css({
    overflowY: 'scroll',
    height: 400
  });
  offsetParent.css({
    marginTop: 200,
    height: 600
  });
  environment.scrollTop(300);
  let m = sprite(target);
  assert.visuallyConstant(target, () => {
    m.lock();
  });
});

test("within scrolling offset parent", function(assert) {
  intermediate.css({
    height: 4000,
    width: '200%',
    paddingTop: 2000
  });
  offsetParent.css({
    overflow: 'scroll',
    height: 100,
    width: '100%'
  });
  offsetParent.scrollTop(2000);
  offsetParent.scrollLeft(10);
  let m = sprite(target);
  assert.visuallyConstant(target, () => {
    m.lock();
  });
});

test("target absolutely positioned", function(assert) {
  target.css({
    position: 'absolute',
    top: 100,
    left: 200
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("target absolutely positioned, border on offsetParent", function(assert) {
  target.css({
    position: 'absolute',
    top: 100,
    left: 200
  });
  offsetParent.css({
    border: '1px solid green'
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});


test("target absolutely positioned with transformed ancestor beneath nearest positioned ancestor", function(assert) {
  target.css({
    position: 'absolute',
    top: 100,
    left: 200
  });
  intermediate.css('transform', 'translateX(10px)');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("target absolutely positioned with transformed ancestor with border beneath nearest positioned ancestor", function(assert) {
  target.css({
    position: 'absolute',
    top: 100,
    left: 200
  });
  intermediate.css('transform', 'translateX(10px)');
  intermediate.css('border', '1px solid green');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("target fixed positioned", function(assert){
  target.css({
    position: 'fixed',
    top: 100,
    left: 200
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("static body with margins", function(assert) {
  let body = $('body');
  assert.equal(getComputedStyle(body[0]).position, 'static', 'This test cannot work correctly if the body is not statically positioned');
  body.append(intermediate);
  intermediate.css({
    margin: '10px'
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("static body with scroll", function(assert) {
  let body = $('body');
  assert.equal(getComputedStyle(body[0]).position, 'static', 'This test cannot work correctly if the body is not statically positioned');
  body.append(intermediate);
  intermediate.css({
    margin: '10px',
    height: '200%',
    width: '200%',
    paddingTop: '50%'
  });
  $(window).scrollTop(100);
  $(window).scrollLeft(10);

  assert.equal($(window).scrollTop(), 100, 'ensure we really scrolled the body');
  assert.equal($(window).scrollLeft(), 10, 'ensure we really scrolled the body');
  let m = sprite(target);
  assert.visuallyConstant(target, () => m.lock());
});

test("remembers initial bounds", function(assert) {
  let m = sprite(target);
  assert.approxEqualPixels(m.initialBounds.top, $('.sibling').height(), 'top relative to parent');
  assert.approxEqualPixels(m.initialBounds.left, 0, 'left relative to parent');
});

test("measures and remembers final bounds", function(assert) {
  let m = sprite(target);
  target.css('transform', 'translateX(100px)');
  m.measureFinalBounds();
  assert.approxEqualPixels(m.finalBounds.top, m.initialBounds.top, 'top constant');
  assert.approxEqualPixels(m.initialBounds.left + 100, m.finalBounds.left, 'left reflects movement');
});

test("requires an initial position sprite to have an initial positioned offset measurement", function(assert) {
  let parent = Sprite.offsetParentEndingAt(target[0]);
  assert.throws(() => {
    Sprite.positionedStartingAt(target[0], parent);
  }, /must have initial bounds/);
});

test("requires a final position sprite to have a final positioned offset measurement", function(assert) {
  let parent = Sprite.offsetParentStartingAt(target[0]);
  assert.throws(() => {
    Sprite.positionedEndingAt(target[0], parent);
  }, /must have final bounds/);
});

test("can initialize in final position", function(assert) {
  let parent = Sprite.offsetParentEndingAt(target[0]);
  let m = Sprite.positionedEndingAt(target[0], parent);
  assert.approxEqualPixels(m.finalBounds.top, $('.sibling').height(), 'top relative to parent');
  assert.approxEqualPixels(m.finalBounds.left, 0, 'left relative to parent');
});

test("can get current bounds", function(assert) {
  let m = sprite(target);
  target.css('transform', 'translateX(100px) translateY(120px)');
  let b = m.getCurrentBounds();
  assert.approxEqualPixels(b.top - 120, m.initialBounds.top, 'top reflects movement');
  assert.approxEqualPixels(b.left - 100, m.initialBounds.left, 'left reflects movement');
});

test("current bounds are unaffected by parent movement", function(assert) {
  let m = sprite(target);
  offsetParent.css('transform', 'translateX(100px) translateY(120px)');
  let b = m.getCurrentBounds();
  assert.approxEqualPixels(b.top, m.initialBounds.top, 'top constant');
  assert.approxEqualPixels(b.left, m.initialBounds.left, 'left constant');
});

test("start translated", function(assert) {
  let parent = makeParent(target);
  parent.measureFinalBounds();
  let m = Sprite.positionedEndingAt(target[0], parent);
  m.startTranslatedBy(100, 200);
  assert.approxEqualPixels(m.initialBounds.left - 100, m.finalBounds.left, 'left');
  assert.approxEqualPixels(m.initialBounds.top - 200, m.finalBounds.top, 'top');
  assert.equalBounds(m.initialBounds, m.getCurrentBounds(), 'current matches initial');
});

test("start translated, accounts for parent motion", function(assert) {
  let parent = makeParent(target);
  offsetParent.css('transform', 'translateX(100px) translateY(120px)');
  parent.measureFinalBounds();

  let m = Sprite.positionedEndingAt(target[0], parent);
  m.startTranslatedBy(300, 320);

  assert.approxEqualPixels(m.initialBounds.left - 300 + 100, m.finalBounds.left, 'left');
  assert.approxEqualPixels(m.initialBounds.top - 320 + 120, m.finalBounds.top, 'top');
  assert.equalBounds(m.initialBounds, m.getCurrentBounds(), 'current matches initial');
});



test("target's margins collapse with its children", function(assert){
  innerContent.css({
    marginTop: 10,
    marginBottom: 20
  });
  let m = sprite(target);
  assert.visuallyConstant(target, () => {
    assert.visuallyConstant(innerContent, () => {
      m.lock();
    }, 'inner content bounds');
  }, 'target bounds')

  assert.visuallyConstant(target, () => {
    assert.visuallyConstant(innerContent, () => {
      m.unlock();
    }, 'inner content bounds unlock');
  }, 'target bounds unlock')

});

test("Sprite is sealed in test mode", function(assert) {
  let m = sprite(target);
  assert.throws(() => {
    m.somethingExtra = true;
  });
});

skip("polyfills WeakMap as needed (and remember to adjust eslint config)", function(assert) {
  assert.ok(false);
});

skip("polyfills Map as needed (and remember to adjust eslint config)", function(assert) {
  assert.ok(false);
});

skip("polyfills rAF as needed", function(assert) {
  assert.ok(false);
});

function makeParent($elt) {
  return Sprite.offsetParentStartingAt($elt[0]);
}

function makeSprite($elt, parent) {
  return Sprite.positionedStartingAt($elt[0], parent);
}

function sprite($elt) {
  let parent = makeParent($elt);
  parent.measureFinalBounds();
  return makeSprite($elt, parent);
}

function addMargins($elt) {
  $elt.css({
    marginTop: '40px',
    marginLeft: '50px',
    marginRight: '60px',
    marginBottom: '70px'
  });
}

function addPadding($elt) {
  $elt.css({
    paddingTop: '8px',
    paddingLeft: '9px',
    paddingRight: '10px',
    paddingBottom: '11px'
  });
}
