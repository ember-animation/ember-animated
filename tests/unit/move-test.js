import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import Sprite from 'ember-animated/-private/sprite';
import { Move } from 'ember-animated/motions/move';
import {
  equalBounds,
  approxEqualPixels,
  visuallyConstant,
} from '../helpers/assertions';
import { MotionTester, TimeControl } from 'ember-animated/test-support';

let tester, environment, offsetParent, target, innerContent, time;

module('Unit | Move', function(hooks) {
  hooks.beforeEach(function(assert) {
    assert.equalBounds = equalBounds;
    assert.approxEqualPixels = approxEqualPixels;
    assert.visuallyConstant = visuallyConstant;

    time = new TimeControl();

    tester = MotionTester.create({
      motion: Move,
    });

    let fixture = document.querySelector('#qunit-fixture');
    fixture.innerHTML = `
<div class="environment">
  <div class="offset-parent">
    <div class="sibling"></div>
    <div class="target">
      <div class="inner-content"></div>
    </div>
    <div class="sibling"></div>
  </div>
</div>
`;
    environment = fixture.querySelector('.environment');
    offsetParent = fixture.querySelector('.offset-parent');
    target = fixture.querySelector('.target');
    innerContent = fixture.querySelector('.inner-content');
    environment.style.width = '600px';
    offsetParent.style.position = 'relative';
    innerContent.style.width = '400px';
  });

  hooks.afterEach(function() {
    time.finished();
  });

  test('simple motion', function(assert) {
    assert.expect(2);
    let p = Sprite.offsetParentStartingAt(target);
    p.measureFinalBounds();
    let s = Sprite.positionedStartingAt(target, p);
    let startBounds = s.element.getBoundingClientRect();
    target.style.left = '300px';
    target.style.top = '400px';
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
    run(() => {
      tester.run(s, { duration: 60 }).then(done, done);
      time.advance(60);
    });
  });

  test('simple motion, interrupted', function(assert) {
    target.style['margin-left'] = '0px';
    target.style['margin-top'] = '0px';
    target.style.position = 'relative';

    let p = Sprite.offsetParentStartingAt(target);
    p.measureFinalBounds();
    let s = Sprite.positionedStartingAt(target, p);

    target.style.left = '300px';
    target.style.top = '400px';

    s.measureFinalBounds();
    s.lock();

    run(() => {
      tester.run(s, { duration: 1000 });
    });

    return time.advance(500).then(() => {
      assert.approxEqualPixels(
        s.getCurrentBounds().top,
        s.initialBounds.top + 200,
        'top',
      );
      assert.approxEqualPixels(
        s.getCurrentBounds().left,
        s.initialBounds.left + 150,
        'left',
      );
      let newSprite = Sprite.positionedStartingAt(target, p);
      newSprite.lock();
      target.style.left = '400px';
      target.style.top = '500px';
      newSprite.unlock();
      newSprite.measureFinalBounds();
      newSprite.lock();

      run(() => {
        tester.run(newSprite, { duration: 1000 });
      });
      assert.approxEqualPixels(
        newSprite.getCurrentBounds().top,
        s.initialBounds.top + 200,
        'top continuity',
      );
      assert.approxEqualPixels(
        newSprite.getCurrentBounds().left,
        s.initialBounds.left + 150,
        'left continuity',
      );
      return time.advance(1005).then(() => {
        assert.visuallyConstant(target, () => {
          newSprite.unlock();
        });
      });
    });
  });

  test('interrupting with same destination does not extend animation time', function(assert) {
    let p = Sprite.offsetParentStartingAt(target);
    p.measureFinalBounds();
    let s = Sprite.positionedStartingAt(target, p);
    s.lock();
    document.querySelector('#qunit-fixture .sibling').style.height = '50px';
    s.unlock();
    s.measureFinalBounds();
    s.lock();

    run(() => {
      tester.run(s, { duration: 1000 });
    });

    return time.advance(500).then(() => {
      assert.approxEqualPixels(
        s.getCurrentBounds().top,
        s.initialBounds.top + 25,
        'top',
      );
      let newSprite = Sprite.positionedStartingAt(target, p);
      newSprite.lock();
      newSprite.unlock();
      newSprite.measureFinalBounds();

      newSprite.lock();

      run(() => {
        tester.run(newSprite, { duration: 1000 });
      });
      return time.advance(501).then(() => {
        assert.ok(!tester.get('isAnimating'), 'should be finished by now');
      });
    });
  });

  test('overshooting motion', async function(assert) {
    target.style['margin-left'] = '0px';
    target.style['margin-top'] = '0px';
    target.style.position = 'relative';

    let p = Sprite.offsetParentStartingAt(target);
    p.measureFinalBounds();
    let s = Sprite.positionedStartingAt(target, p);
    target.style.left = '400px';
    s.measureFinalBounds();
    s.lock();

    let motion = new Move(s, {
      easing: (v) => v < 0.5 ? -v : 2 - v
    });

    tester.run(motion, { duration: 400 });
    await time.advance(100);
    assert.equal(s.getCurrentBounds().left, -100);
    await time.advance(200);
    assert.equal(s.getCurrentBounds().left, 500);
    await time.advance(100);
    assert.equal(s.getCurrentBounds().left, 400);
  });
});
