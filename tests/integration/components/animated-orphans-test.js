import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { waitForAnimations, macroWait } from 'ember-animated/test-helpers';
import { Promise } from 'ember-animated/concurrency-helpers';
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
  await macroWait();
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
  assert.expect(6);

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

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 'first transition removed');
    assert.equal(this.keptSprites.length, 0, 'first transition kept');
    assert.equal(this.insertedSprites.length, 0, 'first transition inserted');
    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  this.set('showIt', false);
  await macroWait();

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 0, 'second transition removed');
    assert.equal(this.keptSprites.length, 1, 'second transition kept');
    assert.equal(this.insertedSprites.length, 0, 'second transition inserted');
    this.keptSprites.forEach(s => this.animate(new TestMotion(s)));
  });
  this.set('showIt', true);
  await this.waitForAnimations();
});

test('drops sprites that had not starting animating when interruption occured', async function(assert) {
  assert.expect(12);

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

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 'first t1 removed');
    assert.equal(this.keptSprites.length, 0, 'first t1 kept');
    assert.equal(this.insertedSprites.length, 0, 'first t1 inserted');
    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  this.set('t2', function * () {
    assert.equal(this.removedSprites.length, 1, 'first t2 removed');
    assert.equal(this.keptSprites.length, 0, 'first t2 kept');
    assert.equal(this.insertedSprites.length, 0, 'first t2 inserted');
  });

  this.set('showIt', false);
  await macroWait();

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 0, 'second t1 removed');
    assert.equal(this.keptSprites.length, 1, 'second t1 kept');
    assert.equal(this.insertedSprites.length, 0, 'second t1 inserted');
  });

  this.set('t2', function * () {
    assert.equal(this.removedSprites.length, 0, 'second t1 removed');
    assert.equal(this.keptSprites.length, 0, 'second t1 kept');
    assert.equal(this.insertedSprites.length, 1, 'second t1 inserted');
  });

  this.set('showIt', true);
  await this.waitForAnimations();
});

test('drops sprites that finished animating when interruption occured', async function(assert) {
  assert.expect(12);

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

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 1, 'first t1 removed');
    assert.equal(this.keptSprites.length, 0, 'first t1 kept');
    assert.equal(this.insertedSprites.length, 0, 'first t1 inserted');
    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: true })));
  });

  this.set('t2', function * () {
    assert.equal(this.removedSprites.length, 1, 'first t2 removed');
    assert.equal(this.keptSprites.length, 0, 'first t2 kept');
    assert.equal(this.insertedSprites.length, 0, 'first t2 inserted');
    this.removedSprites.forEach(s => this.animate(new TestMotion(s, { shouldBlock: false })));
  });

  this.set('showIt', false);
  await macroWait();

  this.set('t1', function * () {
    assert.equal(this.removedSprites.length, 0, 'second t1 removed');
    assert.equal(this.keptSprites.length, 1, 'second t1 kept');
    assert.equal(this.insertedSprites.length, 0, 'second t1 inserted');
  });

  this.set('t2', function * () {
    assert.equal(this.removedSprites.length, 0, 'second t1 removed');
    assert.equal(this.keptSprites.length, 0, 'second t1 kept');
    assert.equal(this.insertedSprites.length, 1, 'second t1 inserted');
  });

  this.set('showIt', true);
  await this.waitForAnimations();
});
