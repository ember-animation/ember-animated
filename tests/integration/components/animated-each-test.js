/* eslint-disable qunit/no-conditional-assertions */
import { set } from '@ember/object';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import QUnit, { module, test } from 'qunit';
import {
  animationsSettled,
  time,
  setupAnimationTest,
} from 'ember-animated/test-support';
import { Motion, wait } from 'ember-animated';
import { run } from '@ember/runloop';

module('Integration | Component | animated each', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  hooks.beforeEach(function (assert) {
    assert.listContents = function (elts, expected, message) {
      let values = [...elts].map((e) => e.textContent.trim());
      this.pushResult({
        result: QUnit.equiv(values, expected),
        actual: values,
        expected: expected,
        message: message,
      });
    };
  });

  test('it renders', async function (assert) {
    assert.expect(2);
    this.set('items', ['a', 'b', 'c']);
    await render(hbs`
      {{#animated-each items as |item index|}}
        <div class="test-child">{{item}}</div>
        <div class="test-child-index">{{index}}</div>
      {{/animated-each}}
    `);

    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'b',
      'c',
    ]);
    assert.listContents(this.element.querySelectorAll('.test-child-index'), [
      '0',
      '1',
      '2',
    ]);
  });

  test('it renders when list is missing', async function (assert) {
    assert.expect(0);
    await render(hbs`
      {{#animated-each items as |item|}}
        <div class="test-child">{{item}}</div>
      {{/animated-each}}
    `);
  });

  test('it renders the block within else clause', async function (assert) {
    assert.expect(1);
    await render(hbs`
      {{#animated-each items as |item|}}
        <div class="test-child">{{item}}</div>
      {{else}}
        <span>No items</span>
      {{/animated-each}}
    `);
    assert.dom('span').hasText('No items');
  });

  test('it can transition at first render', async function (assert) {
    assert.expect(3);

    let transitionCounter = 0;
    this.set('items', ['a', 'b', 'c']);
    this.set('transition', function* ({ insertedSprites }) {
      assert.strictEqual(insertedSprites.length, 3);
      transitionCounter++;
    });
    await render(hbs`
      {{#animated-each items use=transition initialInsertion=true as |item|}}
        <div class="test-child">{{item}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();

    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'b',
      'c',
    ]);
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });

  test(`it yields each inserted and kept item's final index`, async function (assert) {
    // This is a do-nothing transition. Our "wait" function respects
    // our "time" test helper, so we can manipulate it to make sure we
    // see the state during animation without actually doing any
    // waiting around.
    this.set('transition', function* () {
      yield wait(1000);
    });

    this.set('items', ['a', 'b', 'c']);
    await render(hbs`
      {{#animated-each items use=transition as |item index|}}
        <div class="test-child" data-item={{item}} data-index={{index}}>{{item}}</div>
      {{/animated-each}}
    `);
    await animationsSettled();

    time.pause();
    this.set('items', ['b', 'c', 'q']);
    await time.advance(500); // halfway through the animation
    assert.strictEqual(
      this.element.querySelector('.test-child[data-item="b"]').dataset['index'],
      '0',
    );
    assert.strictEqual(
      this.element.querySelector('.test-child[data-item="c"]').dataset['index'],
      '1',
    );
    assert.strictEqual(
      this.element.querySelector('.test-child[data-item="q"]').dataset['index'],
      '2',
    );
  });

  test(`it doesn't change each removed item's index while it's being animated away`, async function (assert) {
    this.set('transition', function* () {
      yield wait(1000);
    });

    this.set('items', ['a', 'b', 'c']);
    await render(hbs`
      {{#animated-each items use=transition as |item index|}}
        <div class="test-child" data-item={{item}} data-index={{index}}>{{item}}</div>
      {{/animated-each}}
    `);
    await animationsSettled();

    time.pause();
    this.set('items', ['a', 'c']);
    await time.advance(500);
    assert.strictEqual(
      this.element.querySelector('.test-child[data-item="b"]').dataset['index'],
      '1',
    );
  });

  test('it updates when list is replaced', async function (assert) {
    assert.expect(5);

    let transitionCounter = 0;
    this.set('items', ['a', 'b', 'c']);
    this.set(
      'transition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        if (++transitionCounter === 1) {
          assert.strictEqual(keptSprites.length, 2, 'kept sprites');
          assert.strictEqual(insertedSprites.length, 1, 'inserted sprites');
          assert.strictEqual(removedSprites.length, 1, 'removed sprites');
        }
      },
    );
    await render(hbs`
      {{#animated-each items use=transition as |item|}}
        <div class="test-child">{{item}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();

    this.set('items', ['a', 'x', 'c']);

    await animationsSettled();

    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'x',
      'c',
    ]);
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });

  test('it updates when list is mutated', async function (assert) {
    assert.expect(5);

    let transitionCounter = 0;
    this.set('items', A(['a', 'b', 'c']));
    this.set(
      'transition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        if (++transitionCounter === 1) {
          assert.strictEqual(keptSprites.length, 2, 'kept sprites');
          assert.strictEqual(insertedSprites.length, 1, 'inserted sprites');
          assert.strictEqual(removedSprites.length, 1, 'removed sprites');
        }
      },
    );

    await render(hbs`
      {{#animated-each items use=transition as |item|}}
        <div class="test-child">{{item}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();
    run(() => {
      this.get('items').replace(1, 1, ['x']);
    });
    await animationsSettled();
    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'x',
      'c',
    ]);
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });

  test('it animates when an id is mutated', async function (assert) {
    assert.expect(5);
    let transitionCounter = 0;
    this.set('items', A([{ id: 'a' }, { id: 'b' }, { id: 'c' }]));
    this.set(
      'transition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        if (++transitionCounter === 1) {
          assert.strictEqual(keptSprites.length, 2, 'kept sprites');
          assert.strictEqual(insertedSprites.length, 1, 'inserted sprites');
          assert.strictEqual(removedSprites.length, 1, 'removed sprites');
        }
      },
    );
    await render(hbs`
      {{#animated-each items use=transition key="id" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();
    run(() => {
      set(this.get('items')[1], 'id', 'x');
    });
    await animationsSettled();
    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'x',
      'c',
    ]);
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });

  test('it animates when a watched property is mutated', async function (assert) {
    assert.expect(5);
    let transitionCounter = 0;
    this.set('items', A([{ id: 'a', x: 1, y: 2 }, { id: 'b' }, { id: 'c' }]));
    this.set(
      'transition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        if (++transitionCounter === 1) {
          assert.strictEqual(keptSprites.length, 3, 'kept sprites');
          assert.strictEqual(insertedSprites.length, 0, 'inserted sprites');
          assert.strictEqual(removedSprites.length, 0, 'removed sprites');
        }
      },
    );

    await render(hbs`
      {{#animated-each items use=transition key="id" watch="x,y" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();

    run(() => {
      set(this.get('items')[0], 'y', 3);
    });

    await animationsSettled();

    assert.listContents(this.element.querySelectorAll('.test-child'), [
      'a',
      'b',
      'c',
    ]);
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });

  test('it can match sprites that are leaving another component', async function (assert) {
    assert.expect(10);

    this.set('leftItems', A([{ id: 'a' }, { id: 'b' }, { id: 'c' }]));
    this.set('rightItems', A([]));

    this.set('leftTransition', function* () {
      throw new Error('unexpected transition');
    });

    this.set('rightTransition', function* () {
      throw new Error('unexpected transition');
    });

    await render(hbs`
      {{#animated-each leftItems use=leftTransition key="id" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
      {{#animated-each rightItems use=rightTransition key="id" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-each}}
    `);

    await animationsSettled();

    this.set(
      'leftTransition',
      function* ({
        receivedSprites,
        insertedSprites,
        removedSprites,
        keptSprites,
        sentSprites,
      }) {
        assert.strictEqual(keptSprites.length, 2, 'left kept');
        assert.strictEqual(removedSprites.length, 0, 'left removed');
        assert.strictEqual(sentSprites.length, 1, 'left sent');
        assert.strictEqual(receivedSprites.length, 0, 'left received');
        assert.strictEqual(insertedSprites.length, 0, 'left inserted');
      },
    );

    this.set(
      'rightTransition',
      function* ({
        receivedSprites,
        insertedSprites,
        removedSprites,
        keptSprites,
        sentSprites,
      }) {
        assert.strictEqual(keptSprites.length, 0, 'right kept');
        assert.strictEqual(removedSprites.length, 0, 'right removed');
        assert.strictEqual(sentSprites.length, 0, 'right sent');
        assert.strictEqual(receivedSprites.length, 1, 'right received');
        assert.strictEqual(insertedSprites.length, 0, 'right inserted');
      },
    );

    this.set('leftItems', A([{ id: 'a' }, { id: 'c' }]));
    this.set('rightItems', A([{ id: 'b' }]));
    await animationsSettled();
  });

  test('it can match sprites that are leaving a destroyed component', async function (assert) {
    assert.expect(1);

    this.set('leftItems', A([{ id: 'a' }, { id: 'b' }, { id: 'c' }]));
    this.set('rightItems', A([{ id: 'b' }]));

    this.set('leftTransition', function* () {
      throw new Error('unexpected left transition');
    });

    this.set('rightTransition', function* () {
      throw new Error('unexpected right transition');
    });

    this.set('leftAlive', true);

    await render(hbs`
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

    await animationsSettled();

    this.set('leftTransition', function* () {
      throw new Error('unexpected left transition');
    });

    this.set('rightTransition', function* ({ receivedSprites }) {
      assert.strictEqual(receivedSprites.length, 1, 'right found match');
    });

    this.set('leftAlive', false);

    await animationsSettled();
  });

  test('child animator can animate when a parent animator is planning to remove it', async function (assert) {
    assert.expect(7);

    function makeItem(id) {
      return {
        id,
        comments: [{ id: `comment-${id}` }],
      };
    }

    this.set('items', ['a', 'b', 'c'].map(makeItem));

    await render(hbs`
      <div style="position: fixed; top: 0; left: 0"><AnimatedOrphans/></div>
      {{#animated-each items use=outerTransition key="id" as |item|}}
        <div class="test-child">
          {{item.id}}
          {{#animated-each item.comments key="id" use=innerTransition finalRemoval=true as |comment|}}
            <div>{{comment.id}}</div>
          {{/animated-each}}
        </div>
      {{/animated-each}}
    `);

    await animationsSettled();

    this.set(
      'outerTransition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        assert.deepEqual(
          keptSprites.map((s) => s.owner.id),
          ['a', 'c'],
          'kept sprites',
        );
        assert.deepEqual(
          insertedSprites.map((s) => s.owner.id),
          [],
          'inserted sprites',
        );
        assert.deepEqual(
          removedSprites.map((s) => s.owner.id),
          ['b'],
          'removed sprites',
        );
      },
    );

    let innerCounter = 0;

    this.set(
      'innerTransition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        innerCounter++;
        assert.deepEqual(
          keptSprites.map((s) => s.owner.id),
          [],
          'kept sprites',
        );
        assert.deepEqual(
          insertedSprites.map((s) => s.owner.id),
          [],
          'inserted sprites',
        );
        assert.deepEqual(
          removedSprites.map((s) => s.owner.id),
          ['comment-b'],
          'removed sprites',
        );
      },
    );

    this.set('items', ['a', 'c'].map(makeItem));
    await animationsSettled();
    assert.strictEqual(innerCounter, 1, 'inner transition should run once');
  });

  test('child animator reacts appropriately if its planned destruction is cancelled', async function (assert) {
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
        comments: [{ id: `comment-${id}` }],
      };
    }

    this.set('items', ['a', 'b', 'c'].map(makeItem));

    await render(hbs`
      <div style="position: fixed; top: 0; left: 0"><AnimatedOrphans/></div>
      {{#animated-each items use=outerTransition key="id" as |item|}}
        <div class="test-child">
          {{item.id}}
          {{#animated-each item.comments key="id" use=innerTransition finalRemoval=true as |comment|}}
            <div>{{comment.id}}</div>
          {{/animated-each}}
        </div>
      {{/animated-each}}
    `);

    await animationsSettled();

    // Create animations that will block forever and notify us when they have started
    let sawOuter, sawInner;
    let outerIsAnimating = new Promise((r) => (sawOuter = r));
    let innerIsAnimating = new Promise((r) => (sawInner = r));
    this.set('outerTransition', function* ({ removedSprites }) {
      removedSprites.forEach((s) => new TestMotion(s).run());
      sawOuter();
    });
    this.set('innerTransition', function* ({ removedSprites }) {
      removedSprites.forEach((s) => new TestMotion(s).run());
      sawInner();
    });

    // Trigger animations
    this.set('items', ['a', 'c'].map(makeItem));

    // Ensure that they have started
    await outerIsAnimating;
    await innerIsAnimating;

    this.set(
      'outerTransition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        assert.deepEqual(
          keptSprites.map((s) => s.owner.id).sort(),
          ['a', 'b', 'c'],
          'kept sprites',
        );
        assert.deepEqual(
          insertedSprites.map((s) => s.owner.id),
          [],
          'inserted sprites',
        );
        assert.deepEqual(
          removedSprites.map((s) => s.owner.id),
          [],
          'removed sprites',
        );
      },
    );

    let innerCounter = 0;
    this.set(
      'innerTransition',
      function* ({ receivedSprites, insertedSprites, removedSprites }) {
        innerCounter++;
        assert.deepEqual(
          receivedSprites.map((s) => s.owner.id),
          ['comment-b'],
          'received sprites',
        );
        assert.deepEqual(
          insertedSprites.map((s) => s.owner.id),
          [],
          'inserted sprites',
        );
        assert.deepEqual(
          removedSprites.map((s) => s.owner.id),
          [],
          'removed sprites',
        );
      },
    );

    // Interrupt with a new animation that undoes the previous change
    this.set('items', ['a', 'b', 'c'].map(makeItem));

    await animationsSettled();
    assert.strictEqual(innerCounter, 1, 'inner transition should run once');
  });

  test('does not animate removed sprites at final destruction by default', async function (assert) {
    let transitionCounter = 0;

    this.set('transition', function* () {
      transitionCounter++;
    });

    this.set('alive', true);
    this.set('items', ['a']);

    await render(hbs`
      <div style="position: fixed; top: 0; left: 0"><AnimatedOrphans/></div>
      {{#if alive}}
        {{#animated-each items use=transition as |item|}}
          <div class="test-child">
            {{item.id}}
          </div>
        {{/animated-each}}
      {{/if}}
    `);

    await animationsSettled();

    this.set('alive', false);
    await settled();
    await animationsSettled();
    assert.strictEqual(transitionCounter, 0, 'transitionCounter');
  });

  test('can opt in to animating removed sprites at final destruction', async function (assert) {
    let transitionCounter = 0;

    this.set('items', ['a']);
    this.set('transition', function* () {
      transitionCounter++;
    });

    this.set('alive', true);

    await render(hbs`
      <div style="position: fixed; top: 0; left: 0"><AnimatedOrphans/></div>
      {{#if alive}}
        {{#animated-each items use=transition finalRemoval=true as |item|}}
          <div class="test-child">
            {{item.id}}
          </div>
        {{/animated-each}}
      {{/if}}
    `);

    await animationsSettled();
    assert.strictEqual(transitionCounter, 0, 'transitionCounter precondition');

    this.set('alive', false);
    await settled();
    await animationsSettled();
    assert.strictEqual(transitionCounter, 1, 'transitionCounter!');
  });
});
