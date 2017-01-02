import { module, test } from 'qunit';
import Sprite from 'ember-animated/sprite';
import $ from 'jquery';
import Ember from 'ember';
import { task } from 'ember-concurrency';
import Move from 'ember-animated/motions/move';
import {
  equalBounds,
} from '../helpers/assertions';

let Harness = Ember.Object.extend({
  beforeAnimation(){},
  afterAnimation(){},
  run(sprite) {
    let p;
    Ember.run(() => {
      p = this.get('_run').perform(sprite);
    });
    return p;
  },
  _run: task(function * (sprite) {
    let motion = new Move(sprite);
    motion.duration = 1;
    this.beforeAnimation(sprite);
    yield * motion._run();
    this.afterAnimation(sprite);
  })
});

let harness, environment, offsetParent, target, innerContent;

module("Unit | Move", {
  beforeEach(assert) {
    assert.equalBounds = equalBounds;

    harness = new Harness();
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

  harness.beforeAnimation = sprite => {
    assert.equalBounds(sprite.element.getBoundingClientRect(), startBounds);
  };

  harness.afterAnimation = sprite => {
    assert.equalBounds(sprite.element.getBoundingClientRect(), endBounds);
  };

  return harness.run(s);
});
