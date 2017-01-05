import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import QUnit from 'qunit';
import $ from 'jquery';
import { waitForAnimations } from 'ember-animated/test-helpers';
import Ember from 'ember';
const { A } = Ember;

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

// I am unsure whether we care about supporting this behavior. As of
// right now, it can do surprising things: (1) we don't observe the
// change, (2) if you somehow trigger rerender anyway, you can end up
// with duplicate list entries. To avoid this we would need to do more
// preemptive copying.
test('it animates when an id is mutated', function(assert) {
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

    // You can uncomment this to trigger the rerender behavior.
    // this.set('items', this.get('items').slice());

    return this.waitForAnimations();
  }).then(() => {
    assert.listContents(this.$('.test-child'), ['a', 'x', 'c']);
    assert.equal(transitionCounter, 2, 'transitionCounter');
  });
});


skip('check (on several platforms) whether we really need the ember-animated-hidden class. It may not be necessary with our microtask-based motions');
