import { module, test } from 'qunit';
import Sprite from 'ember-animated/sprite';
import $ from 'jquery';
import Move from 'ember-animated/motions/move';
import Ember from 'ember';
import {
  equalBounds,
  approxEqualPixels,
  visuallyConstant
} from '../helpers/assertions';
import { TimeControl, MotionTester } from 'ember-animated/test-helpers';

let tester, environment, offsetParent, target, innerContent, time;

module("Unit | Move", {
  beforeEach(assert) {
    assert.equalBounds = equalBounds;
    assert.approxEqualPixels = approxEqualPixels;
    assert.visuallyConstant = visuallyConstant;

    time = new TimeControl();

    tester = MotionTester.create({
      motion: Move
    });

    let fixture = $('#qunit-fixture');
    fixture.html(`
<div class="environment">
  <div class="offset-parent">
    <div class="sibling"></div>
    <div class="target">
      <div class="inner-content"></div>
    </div>
    <div class="sibling"></div>
  </div>
</div>
`);
    environment = fixture.find('.environment');
    offsetParent = fixture.find('.offset-parent');
    target = fixture.find('.target');
    innerContent = fixture.find('.inner-content');
    environment.width(600);
    offsetParent.css({
      position: 'relative'
    });
    innerContent.height(400);
  },
  afterEach() {
    time.finished();
  }

});

test("simple motion", function(assert) {
  assert.expect(2);
  let p = Sprite.offsetParentStartingAt(target[0]);
  p.measureFinalBounds();
  let s = Sprite.positionedStartingAt(target[0], p);
  let startBounds = s.element.getBoundingClientRect();
  target.css({
    left: 300,
    top: 400
  });
  let endBounds = s.element.getBoundingClientRect();
  s.measureFinalBounds();
  s.lock();

  tester.beforeAnimation = () => {
    assert.equalBounds(s.element.getBoundingClientRect(), startBounds);
  };

  tester.afterAnimation = () => {
    assert.equalBounds(s.element.getBoundingClientRect(), endBounds);
  };

  let done = assert.async();
  Ember.run(() => {
    tester.run(s, { duration: 60 }).then(done, done);
    time.advance(60);
  });
});

test("simple motion, interrupted", function(assert) {
  target.css({
    marginLeft: 0,
    marginTop: 0,
    position: 'relative'
  });

  let p = Sprite.offsetParentStartingAt(target[0]);
  p.measureFinalBounds();
  let s = Sprite.positionedStartingAt(target[0], p);

  target.css({
    left: 300,
    top: 400
  });

  s.measureFinalBounds();
  s.lock();


  Ember.run(() => {
    tester.run(s, { duration: 1000 });
  });

  return time.advance(500).then(() => {
    assert.approxEqualPixels(s.getCurrentBounds().top, s.initialBounds.top + 200, 'top');
    assert.approxEqualPixels(s.getCurrentBounds().left, s.initialBounds.left + 150, 'left');
    let newSprite = Sprite.positionedStartingAt(target[0], p);
    newSprite.lock();
    target.css({
      left: 400,
      top: 500
    });
    newSprite.unlock();
    newSprite.measureFinalBounds();
    newSprite.lock();

    Ember.run(() => {
      tester.run(newSprite, { duration: 1000 });
    });
    assert.approxEqualPixels(newSprite.getCurrentBounds().top, s.initialBounds.top + 200, 'top continuity');
    assert.approxEqualPixels(newSprite.getCurrentBounds().left, s.initialBounds.left + 150, 'left continuity');
    return time.advance(1005).then(() => {
      assert.visuallyConstant(target, () => {
        newSprite.unlock();
      });
    });
  });
});

test("interrupting with same destination does not extend animation time", function(assert) {
  let p = Sprite.offsetParentStartingAt(target[0]);
  p.measureFinalBounds();
  let s = Sprite.positionedStartingAt(target[0], p);
  s.lock();
  $('#qunit-fixture').find('.sibling').css('height', 50);
  s.unlock();
  s.measureFinalBounds();
  s.lock();

  Ember.run(() => {
    tester.run(s, { duration: 1000 });
  });

  return time.advance(500).then(() => {
    assert.approxEqualPixels(s.getCurrentBounds().top, s.initialBounds.top + 25, 'top');
    let newSprite = Sprite.positionedStartingAt(target[0], p);
    newSprite.lock();
    newSprite.unlock();
    newSprite.measureFinalBounds();

    newSprite.lock();

    Ember.run(() => {
      tester.run(newSprite, { duration: 1000 });
    });
    return time.advance(501).then(() => {
      assert.ok(!tester.get('isAnimating'), "should be finished by now");
    });
  });
});
