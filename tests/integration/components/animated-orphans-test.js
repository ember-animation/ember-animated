import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { waitForAnimations } from 'ember-animated/test-helpers';
import { Promise, wait } from 'ember-animated/concurrency-helpers';
import { equalBounds } from '../../helpers/assertions';
import Motion from 'ember-animated/motion';

moduleForComponent('animated-orphans', 'Integration | Component | animated orphans', {
  integration: true,
  beforeEach(assert) {
    this.waitForAnimations = waitForAnimations;
    assert.equalBounds = equalBounds;
  }
});

class TestMotion extends Motion {
  *animate() {
    if (this.opts && this.opts.shouldBlock) {
      yield new Promise(() => {});
    }
  }
}


test('it finds destroyed sprite', async function(assert) {
  assert.expect(2);
  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 0, 'first transition');
  });
  this.set('showIt', true);

  this.render(hbs`
{{animated-orphans}}

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <span class="one">One</span>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 'second transition');
  });

  this.set('showIt', false);
  await this.waitForAnimations();
});

test('it runs all orphan transitions in parallel', async function(assert) {
  assert.expect(4);
  this.set('showIt', true);
  this.render(hbs`
{{animated-orphans}}

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <span class="one">One</span>
  {{/animated-bind}}
  {{#animated-bind "two" use=t2}}
    <span class="two">Two</span>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  let unblock1, unblock2;


  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 't1');
    yield new Promise(r => unblock1 = r);
  });

  this.set('t2', function * () {
    assert.equal(this.removedSprites.length, 1, 't2');
    yield new Promise(r => unblock2 = r);
  });

  this.set('showIt', false);
  await wait();
  assert.ok(unblock1, 'unblock1');
  assert.ok(unblock2, 'unblock2');
  unblock1();
  unblock2();
  await this.waitForAnimations();
});

test('it places orphan sprite at correct bounds', async function(assert) {
  assert.expect(2);

  this.set('showIt', true);
  this.render(hbs`
{{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
<div style="position: fixed; top: 0px; left: 0px">
 {{animated-orphans}}
</div>

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <div class="one">One</div>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  let firstBounds = this.$('.one')[0].getBoundingClientRect();

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 'second transition');
    this.animate(new TestMotion(this.removedSprites[0]));
    assert.equalBounds(firstBounds, this.removedSprites[0].element.getBoundingClientRect());
  });

  this.set('showIt', false);
  await this.waitForAnimations();

});

test('makes orphan sprites eligible for far matching back into other animators', async function(assert) {
  assert.expect(15);

  this.set('showIt', true);
  this.render(hbs`
{{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
<div style="position: fixed; top: 0px; left: 0px">
 {{animated-orphans}}
</div>

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <div class="one">One</div>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  let counter = 0;

  // This transition will run twice. First when the orphaned sprite is
  // animated as a removedSprite, and then when that is interrupted,
  // again with the orphaned sprite as a sentSprite.
  this.set('t1', function * () {
    counter++;
    if (counter === 1) {
      assert.equal(this.removedSprites.length, 1, 'first removed');
      assert.equal(this.sentSprites.length, 0, 'first second');
    } else if (counter === 2) {
      assert.equal(this.removedSprites.length, 0, 'second removed, old sprite');
      assert.equal(this.sentSprites.length, 1, 'second sent, old sprite');
    } else {
      assert.ok(false, "should only run twice");
    }
    assert.equal(this.keptSprites.length, 0, 'both times kept, old sprite');
    assert.equal(this.insertedSprites.length, 0, 'both times inserted, old sprite');
    assert.equal(this.receivedSprites.length, 0, 'both times received, old sprite');
    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  this.set('showIt', false);
  await wait();

  // This will first concurrently with the second run of the
  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 0, 'second removed, new sprite');
    assert.equal(this.keptSprites.length, 0, 'second kept, new sprite');
    assert.equal(this.insertedSprites.length, 0, 'second inserted, new sprite');
    assert.equal(this.sentSprites.length, 0, 'second sent, new sprite');
    assert.equal(this.receivedSprites.length, 1, 'second received, new sprite');
    this.keptSprites.forEach(s => this.animate(new TestMotion(s)));
  });
  this.set('showIt', true);
  await this.waitForAnimations();
});

test('drops sprites that had not starting animating when interruption occured', async function(assert) {
  assert.expect(25);

  this.set('showIt', true);
  this.render(hbs`
{{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
<div style="position: fixed; top: 0px; left: 0px">
 {{animated-orphans}}
</div>

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <div class="one">One</div>
  {{/animated-bind}}
  {{#animated-bind "two" use=t2}}
    <div class="one">One</div>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  let t1Counter = 0;

  this.set('t1', function * () {
    t1Counter++;

    if (t1Counter === 1) {
      assert.equal(this.removedSprites.length, 1, `t1 removed ${t1Counter}`);
      assert.equal(this.sentSprites.length, 0, `t1 sent ${t1Counter}`);
    } else if (t1Counter === 2) {
      assert.equal(this.removedSprites.length, 0, `t1 removed ${t1Counter}`);
      assert.equal(this.sentSprites.length, 1, `t1 sent ${t1Counter}`);
    } else {
      assert.ok(false, 'should t1 only run twice');
    }

    assert.equal(this.keptSprites.length, 0, `t1 kept ${t1Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t1 inserted ${t1Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t1 received ${t1Counter}`);

    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  let t2Counter = 0;

  this.set('t2', function * () {
    t2Counter++;

    if (t2Counter === 1) {
      assert.equal(this.removedSprites.length, 1, `t2 removed ${t2Counter}`);
      assert.equal(this.sentSprites.length, 0, `t2 sent ${t2Counter}`);
    } else {
      assert.ok(false, 'should t2 only run once');
    }
    assert.equal(this.keptSprites.length, 0, `t2 kept ${t2Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t2 inserted ${t2Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t2 received ${t2Counter}`);
  });

  this.set('showIt', false);
  await wait();

  this.set('t1', function * () {
    let t1Counter = 3;
    assert.equal(this.removedSprites.length, 0, `t1 removed ${t1Counter}`);
    assert.equal(this.sentSprites.length, 0, `t1 sent ${t1Counter}`);
    assert.equal(this.keptSprites.length, 0, `t1 kept ${t1Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t1 inserted ${t1Counter}`);
    assert.equal(this.receivedSprites.length, 1, `t1 received ${t1Counter}`);
  });

  this.set('t2', function * () {
    let t2Counter = 3;
    assert.equal(this.removedSprites.length, 0, `t2 removed ${t2Counter}`);
    assert.equal(this.sentSprites.length, 0, `t2 sent ${t2Counter}`);
    assert.equal(this.keptSprites.length, 0, `t2 kept ${t2Counter}`);
    assert.equal(this.insertedSprites.length, 1, `t2 inserted ${t2Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t2 received ${t2Counter}`);
  });

  this.set('showIt', true);
  await this.waitForAnimations();
});

test('drops sprites that finished animating when interruption occured', async function(assert) {
  assert.expect(25);

  this.set('showIt', true);
  this.render(hbs`
{{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
<div style="position: fixed; top: 0px; left: 0px">
 {{animated-orphans}}
</div>

{{#if showIt}}
  {{#animated-bind "one" use=t1}}
    <div class="one">One</div>
  {{/animated-bind}}
  {{#animated-bind "two" use=t2}}
    <div class="one">One</div>
  {{/animated-bind}}
{{/if}}
`)
  await this.waitForAnimations();

  let t1Counter = 0;

  this.set('t1', function * () {
    t1Counter++;

    if (t1Counter === 1) {
      assert.equal(this.removedSprites.length, 1, `t1 removed ${t1Counter}`);
      assert.equal(this.sentSprites.length, 0, `t1 sent ${t1Counter}`);
    } else if (t1Counter === 2) {
      assert.equal(this.removedSprites.length, 0, `t1 removed ${t1Counter}`);
      assert.equal(this.sentSprites.length, 1, `t1 sent ${t1Counter}`);
    } else {
      assert.ok(false, 'should t1 only run twice');
    }

    assert.equal(this.keptSprites.length, 0, `t1 kept ${t1Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t1 inserted ${t1Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t1 received ${t1Counter}`);

    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  let t2Counter = 0;

  this.set('t2', function * () {
    t2Counter++;

    if (t2Counter === 1) {
      assert.equal(this.removedSprites.length, 1, `t2 removed ${t2Counter}`);
      assert.equal(this.sentSprites.length, 0, `t2 sent ${t2Counter}`);
    } else {
      assert.ok(false, 'should t2 only run once');
    }
    assert.equal(this.keptSprites.length, 0, `t2 kept ${t2Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t2 inserted ${t2Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t2 received ${t2Counter}`);

    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: false })));
  });

  this.set('showIt', false);
  await wait();

  this.set('t1', function * () {
    let t1Counter = 3;
    assert.equal(this.removedSprites.length, 0, `t1 removed ${t1Counter}`);
    assert.equal(this.sentSprites.length, 0, `t1 sent ${t1Counter}`);
    assert.equal(this.keptSprites.length, 0, `t1 kept ${t1Counter}`);
    assert.equal(this.insertedSprites.length, 0, `t1 inserted ${t1Counter}`);
    assert.equal(this.receivedSprites.length, 1, `t1 received ${t1Counter}`);
  });

  this.set('t2', function * () {
    let t2Counter = 3;
    assert.equal(this.removedSprites.length, 0, `t2 removed ${t2Counter}`);
    assert.equal(this.sentSprites.length, 0, `t2 sent ${t2Counter}`);
    assert.equal(this.keptSprites.length, 0, `t2 kept ${t2Counter}`);
    assert.equal(this.insertedSprites.length, 1, `t2 inserted ${t2Counter}`);
    assert.equal(this.receivedSprites.length, 0, `t2 received ${t2Counter}`);
  });

  this.set('showIt', true);
  await this.waitForAnimations();
});
