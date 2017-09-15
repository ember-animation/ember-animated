import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import QUnit from 'qunit';
import $ from 'jquery';
import { waitForAnimations } from 'ember-animated/test-helpers';
import Ember from 'ember';
const { A } = Ember;
import { Promise } from 'ember-animated/concurrency-helpers';
import Motion from 'ember-animated/motion';

moduleForComponent('animated-each', 'Integration | Component | animated each', {
  integration: true,
  beforeEach(assert) {
    this.waitForAnimations = waitForAnimations;
    assert.listContents = function( $elts, expected, message ) {
      let values = $elts.toArray().map(e => $(e).text().trim());
      this.pushResult({
        result: QUnit.equiv(values, expected),
        actual: values,
        expected: expected,
        message: message
      });
    };
  }
});

test('it renders', function(assert) {
  this.set('items', ['a', 'b', 'c']);
  this.render(hbs`
    {{#animated-each items as |item|}}
      <div class="test-child">{{item}}</div>
    {{/animated-each}}
  `);

  assert.listContents(this.$('.test-child'), ['a', 'b', 'c']);
});

test('it renders when list is missing', function(assert) {
  assert.expect(0);
  this.render(hbs`
    {{#animated-each items as |item|}}
      <div class="test-child">{{item}}</div>
    {{/animated-each}}
  `);
});

test('it can transition at first render', function(assert) {
  let transitionCounter = 0;
  this.set('items', ['a', 'b', 'c']);
  this.set('transition', function * () {
    assert.equal(this.insertedSprites.length, 3);
    transitionCounter++;
  });
  this.render(hbs`
    {{#animated-each items use=transition as |item|}}
      <div class="test-child">{{item}}</div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'b', 'c']);
    assert.equal(transitionCounter, 1, 'transitionCounter');
  });
});

test('it updates when list is replaced', function(assert) {
  let transitionCounter = 0;
  this.set('items', ['a', 'b', 'c']);
  this.set('transition', function * () {
    if (++transitionCounter === 2) {
      assert.equal(this.keptSprites.length, 2, 'kept sprites');
      assert.equal(this.insertedSprites.length, 1, 'inserted sprites');
      assert.equal(this.removedSprites.length, 1, 'removed sprites');
    }
  });
  this.render(hbs`
    {{#animated-each items use=transition as |item|}}
      <div class="test-child">{{item}}</div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    this.set('items', ['a', 'x', 'c']);
    return this.waitForAnimations();
  }).then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'x', 'c']);
    assert.equal(transitionCounter, 2, 'transitionCounter');
  });
});

test('it updates when list is mutated', function(assert) {
  let transitionCounter = 0;
  this.set('items', A(['a', 'b', 'c']));
  this.set('transition', function * () {
    if (++transitionCounter === 2) {
      assert.equal(this.keptSprites.length, 2, 'kept sprites');
      assert.equal(this.insertedSprites.length, 1, 'inserted sprites');
      assert.equal(this.removedSprites.length, 1, 'removed sprites');
    }
  });
  this.render(hbs`
    {{#animated-each items use=transition as |item|}}
      <div class="test-child">{{item}}</div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    this.get('items').replace(1, 1, ['x']);
    return this.waitForAnimations();
  }).then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'x', 'c']);
    assert.equal(transitionCounter, 2, 'transitionCounter');
  });
});

test('it animates when an id is mutated', function(assert) {
  assert.expect(5);
  let transitionCounter = 0;
  this.set('items', A([{ id: 'a'}, {id: 'b'}, {id: 'c'}]));
  this.set('transition', function * () {
    if (++transitionCounter === 2) {
      assert.equal(this.keptSprites.length, 2, 'kept sprites');
      assert.equal(this.insertedSprites.length, 1, 'inserted sprites');
      assert.equal(this.removedSprites.length, 1, 'removed sprites');
    }
  });
  this.render(hbs`
    {{#animated-each items use=transition key="id" as |item|}}
      <div class="test-child">{{item.id}}</div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    Ember.set(this.get('items')[1], 'id', 'x');
    return this.waitForAnimations();
  }).then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'x', 'c']);
    assert.equal(transitionCounter, 2, 'transitionCounter');
  });
});

test('it animates when a watched property is mutated', function(assert) {
  assert.expect(5);
  let transitionCounter = 0;
  this.set('items', A([{ id: 'a', x: 1, y: 2}, {id: 'b'}, {id: 'c'}]));
  this.set('transition', function * () {
    if (++transitionCounter === 2) {
      assert.equal(this.keptSprites.length, 3, 'kept sprites');
      assert.equal(this.insertedSprites.length, 0, 'inserted sprites');
      assert.equal(this.removedSprites.length, 0, 'removed sprites');
    }
  });
  this.render(hbs`
    {{#animated-each items use=transition key="id" watch="x,y" as |item|}}
      <div class="test-child">{{item.id}}</div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    Ember.set(this.get('items')[0], 'y', 3);
    return this.waitForAnimations();
  }).then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'b', 'c']);
    assert.equal(transitionCounter, 2, 'transitionCounter');
  });
});

test('it can match sprites that are leaving another component', function(assert){
  assert.expect(4);

  this.set('leftItems', A([{ id: 'a'}, {id: 'b'}, {id: 'c'}]));
  this.set('rightItems', A([]));

  this.set('leftTransition', function * () {
    assert.equal(this.insertedSprites.length, 3, "first transition");
  });

  this.set('rightTransition', function * () {
    throw new Error("unexpected transition");
  });

  this.render(hbs`
    {{#animated-each leftItems use=leftTransition key="id" as |item|}}
      <div class="test-child">{{item.id}}</div>
    {{/animated-each}}
    {{#animated-each rightItems use=rightTransition key="id" as |item|}}
      <div class="test-child">{{item.id}}</div>
    {{/animated-each}}
  `);
  return this.waitForAnimations().then(() => {

    this.set('leftTransition', function * () {
      assert.equal(this.keptSprites.length, 2, "left kept");
      assert.equal(this.removedSprites.length, 0, "none in removed, because it was captured by the other component");
    });

    this.set('rightTransition', function * () {
      assert.equal(this.keptSprites.length, 1, "right found a match");
    });

    this.set('leftItems', A([{ id: 'a'}, {id: 'c'}]));
    this.set('rightItems', A([{id: 'b'}, ]));
    return this.waitForAnimations();
  });
});

test('it can match sprites that are leaving a destroyed component', function(assert) {
  assert.expect(2);

  this.set('leftItems', A([{ id: 'a'}, {id: 'b'}, {id: 'c'}]));
  this.set('rightItems', A([{id: 'b'}, ]));

  this.set('leftTransition', function * () {
    assert.equal(this.insertedSprites.length, 3, "first transition");
  });

  this.set('rightTransition', function * () {
    throw new Error("unexpected right transition");
  });

  this.set('leftAlive', true);

  this.render(hbs`
    {{#if leftAlive}}
      {{#animated-each leftItems use=leftTransition key="id" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
    {{else}}
      {{#animated-each rightItems use=rightTransition key="id" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
    {{/if}}
  `);
  return this.waitForAnimations().then(() => {

    this.set('leftTransition', function * () {
      throw new Error("unexpected left transition");
    });

    this.set('rightTransition', function * () {
      assert.equal(this.keptSprites.length, 1, "right found match");
    });

    this.set('leftAlive', false);
    return this.waitForAnimations();
  });

});

test('child animator can animate when a parent animator is planning to remove it', async function(assert) {
  assert.expect(7);

  function makeItem(id) {
    return {
      id,
      comments: [{ id: `comment-${id}`}]
    }
  }

  this.set('items', ['a', 'b', 'c'].map(makeItem));

  this.render(hbs`
    {{#animated-each items use=outerTransition key="id" as |item|}}
      <div class="test-child">
        {{item.id}}
        {{#animated-each item.comments key="id" use=innerTransition as |comment|}}
          <div>{{comment.id}}</div>
        {{/animated-each}}
      </div>
    {{/animated-each}}
  `);

  await this.waitForAnimations();

  this.set('outerTransition', function * () {
    assert.deepEqual(this.keptSprites.map(s => s.owner.id), ['a', 'c'], 'kept sprites');
    assert.deepEqual(this.insertedSprites.map(s => s.owner.id), [], 'inserted sprites');
    assert.deepEqual(this.removedSprites.map(s => s.owner.id), ['b'], 'removed sprites');
  });

  let innerCounter = 0;

  this.set('innerTransition', function * () {
    innerCounter++;
    assert.deepEqual(this.keptSprites.map(s => s.owner.id), [], 'kept sprites');
    assert.deepEqual(this.insertedSprites.map(s => s.owner.id), [], 'inserted sprites');
    assert.deepEqual(this.removedSprites.map(s => s.owner.id), ['comment-b'], 'removed sprites');
  });

  this.set('items', ['a', 'c'].map(makeItem));
  await this.waitForAnimations();
  assert.equal(innerCounter, 1, "inner transition should run once")
});

test('child animator reacts appropriately if its planned destruction is cancelled', async function(assert) {
  assert.expect(7);

  // a motion that never finishes
  class TestMotion extends Motion {
    *animate() {
      yield new Promise(() => {});
    }
  }

  function makeItem(id) {
    return {
      id,
      comments: [{ id: `comment-${id}`}]
    }
  }

  this.set('items', ['a', 'b', 'c'].map(makeItem));

  this.render(hbs`
    {{#animated-each items use=outerTransition key="id" as |item|}}
      <div class="test-child">
        {{item.id}}
        {{#animated-each item.comments key="id" use=innerTransition as |comment|}}
          <div>{{comment.id}}</div>
        {{/animated-each}}
      </div>
    {{/animated-each}}
  `);

  await this.waitForAnimations();

  // Create animations that will block forever and notify us when they have started
  let sawOuter, sawInner;
  let outerIsAnimating = new Promise(r => sawOuter = r);
  let innerIsAnimating = new Promise(r => sawInner = r);
  this.set('outerTransition', function * () {
    this.removedSprites.forEach(s => this.animate(new TestMotion(s)));
    sawOuter();
  });
  this.set('innerTransition', function * () {
    this.removedSprites.forEach(s => this.animate(new TestMotion(s)));
    sawInner();
  });

  // Trigger animations
  this.set('items', ['a', 'c'].map(makeItem));

  // Ensure that they have started
  await outerIsAnimating;
  await innerIsAnimating;

  this.set('outerTransition', function * () {
    assert.deepEqual(this.keptSprites.map(s => s.owner.id).sort(), ['a', 'b', 'c'], 'kept sprites');
    assert.deepEqual(this.insertedSprites.map(s => s.owner.id), [], 'inserted sprites');
    assert.deepEqual(this.removedSprites.map(s => s.owner.id), [], 'removed sprites');
  });

  let innerCounter = 0;
  this.set('innerTransition', function * () {
    innerCounter++;
    assert.deepEqual(this.keptSprites.map(s => s.owner.id), ['comment-b'], 'kept sprites');
    assert.deepEqual(this.insertedSprites.map(s => s.owner.id), [], 'inserted sprites');
    assert.deepEqual(this.removedSprites.map(s => s.owner.id), [], 'removed sprites');
  });


  // Interrupt with a new animation that undoes the previous change
  this.set('items', ['a', 'b', 'c'].map(makeItem));

  await this.waitForAnimations();
  assert.equal(innerCounter, 1, "inner transition should run once")
});
