import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import Sprite from 'ember-animated/-private/sprite';
import { rAF, microwait, Motion } from 'ember-animated';
import { MotionTester } from 'ember-animated/test-support';
import $ from 'jquery';
import { logErrors } from 'ember-animated/-private/scheduler';

let tester;

module("Unit | Motion", function(hooks) {
  hooks.beforeEach(function() {
    let fixture = $('#qunit-fixture');
    fixture.html(`
        <div class="target"></div>
    `);
    tester = MotionTester.create();
  });

  hooks.afterEach(function() {
    $('#qunit-fixture').empty();
  });

  test('Can be canceled within ember-concurrency tasks', function(assert) {
    class TestMotion extends Motion {
      * animate() {
        this.frames = 0;
        while (true) {
          yield rAF();
          this.frames++;
        }
      }
    }

    let sprite = new Sprite($('#qunit-fixture > .target')[0]);
    let motion = new TestMotion(sprite);
    tester.run(motion);

    return rAF().then(() => rAF()).then(() => {
      // we waited two frames, which is enough for the animation to
      // start up, then wait for its own rAF, then increment the frame
      // counter.
      let frames = motion.frames;
      assert.ok(frames > 0, "animation is running");
      tester.get('runner').cancelAll();
      return rAF().then(() => rAF()).then(() => {
        // We deliberately waited two frames here to guarantee the
        // animation is really stopped. If we only waited one frame, we
        // could miss it if it's rAF happens to resolve later than ours.
        assert.equal(motion.frames, frames, "stopped animating");
      });
    });

  });

  test('results in Task failure when animation throws asynchronously', function(assert) {
    class TestMotion extends Motion {
      * animate() {
        logErrors(err => {
          if (err.message !== 'simulated failure') {
            throw err;
          }
        });
        yield microwait();
        throw new Error("simulated failure");
      }
    }

    let sprite = new Sprite($('#qunit-fixture > .target')[0]);
    let motion = new TestMotion(sprite);
    let done = assert.async();
    run(() => {
      tester.run(motion).then(() => {
        assert.ok(false, "Not supposed to succeed");
        done();
      }, error => {
        assert.equal(error ? error.message : undefined, 'simulated failure');
        done();
      });
    });
  });

  test('results in Task failure when animation throws synchronously', function(assert) {
    class TestMotion extends Motion {
      * animate() {
        logErrors(err => {
          if (err.message !== 'simulated failure') {
            throw err;
          }
        });
        throw new Error("simulated failure");
      }
    }

    let sprite = new Sprite($('#qunit-fixture > .target')[0]);
    let motion = new TestMotion(sprite);
    let done = assert.async();
    run(() => {
      tester.run(motion).then(() => {
        assert.ok(false, "Not supposed to succeed");
        done();
      }, error => {
        assert.equal(error ? error.message : undefined, 'simulated failure');
        done();
      });
    });
  });
});
