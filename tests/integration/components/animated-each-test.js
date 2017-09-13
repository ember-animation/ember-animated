import { moduleForComponent, test } from 'ember-qunit';
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

test('it finds marked sprites at initial render', function(assert){
  assert.expect(1);

  function makeItem(id) {
    return {
      id,
      altId: `alt-${id}`
    };
  }

  this.set('items', A([makeItem('a'), makeItem('b'), makeItem('c')]));

  this.set('transition', function * () {
    // we find each of the three "normal" top-level sprites, plus the
    // marked inner sprite inside each one.
    assert.equal(this.insertedSprites.length, 6, "first transition");
  });

  this.render(hbs`
    {{#animated-each items use=transition key="id" as |item animator|}}
      <div class="test-child">
       {{#animator.mark-sprite item key="altId"}}
         <div class="inner-animator">{{innerItem.id}}</div>
       {{/animator.mark-sprite}}
     </div>
    {{/animated-each}}
  `);

  return this.waitForAnimations();
});

test('it finds inserted/kept/removed marked sprites', function(assert){
  assert.expect(3);

  function makeItem(id) {
    return {
      id,
      altId: `alt-${id}`
    };
  }

  this.set('items', A([makeItem('a'), makeItem('b'), makeItem('c')]));
  this.set('transition', function * () {});

  this.render(hbs`
    {{#animated-each items use=transition key="id" as |item animator|}}
      <div class="test-child">
       {{#animator.mark-sprite item key="altId"}}
         <div class="inner-animator">{{innerItem.id}}</div>
       {{/animator.mark-sprite}}
     </div>
    {{/animated-each}}
  `);

  return this.waitForAnimations().then(() => {
    this.set('transition', function * () {
      assert.equal(this.insertedSprites.length, 2, 'inserted');
      assert.equal(this.keptSprites.length, 4, 'kept');
      assert.equal(this.removedSprites.length, 2, 'removed');
    });
    this.set('items', A([makeItem('a'), makeItem('b'), makeItem('d')]));
    return this.waitForAnimations();
  });
});
