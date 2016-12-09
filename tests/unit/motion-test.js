import { module, test } from 'qunit';
import Ember from 'ember';
import { task } from 'ember-concurrency';
import Sprite from 'ember-animated/sprite';
import Motion from 'ember-animated/motion';
import { rAF } from 'ember-animated/concurrency-helpers';
import $ from 'jquery';

module("Unit | Motion", {
  beforeEach() {
    let fixture = $('#qunit-fixture');
    fixture.html(`
        <div class="target"></div>
    `);
  },
  afterEach() {
    $('#qunit-fixture').empty();
  }
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

  let HostObject = Ember.Object.extend({
    animate: task(function * () {
      let sprite = new Sprite($('#qunit-fixture > .target')[0], this);
      this.motion = new TestMotion(sprite);
      yield * this.motion._run();
    })
  });

  let hostObject;
  Ember.run(() => {
    hostObject = HostObject.create();
    hostObject.get('animate').perform();
  });

  return rAF().then(() => rAF()).then(() => {
    // we waited two frames, which is enough for the animation to
    // start up, then wait for its own rAF, then increment the frame
    // counter.
    let frames = hostObject.motion.frames;
    assert.ok(frames > 0, "animation is running");
    hostObject.get('animate').cancelAll();
    return rAF().then(() => rAF()).then(() => {
      // We deliberately waited two frames here to guarantee the
      // animation is really stopped. If we only waited one frame, we
      // could miss it if it's rAF happens to resolve later than ours.
      assert.equal(hostObject.motion.frames, frames, "stopped animating");
    });
  });

});
