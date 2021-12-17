/* eslint-disable qunit/no-conditional-assertions */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { animationsSettled } from 'ember-animated/test-support';
import { wait, Motion } from 'ember-animated';
import { equalBounds } from '../../helpers/assertions';

module('Integration | Component | animated orphans', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    assert.equalBounds = equalBounds;
  });

  class TestMotion extends Motion {
    *animate() {
      if (this.opts && this.opts.shouldBlock) {
        yield new Promise(() => {});
      }
    }
  }

  function testMotion(sprite, opts) {
    return new TestMotion(sprite, opts).run();
  }

  test('it finds destroyed sprite', async function (assert) {
    assert.expect(1);
    this.set('showIt', true);

    await render(hbs`
  <AnimatedOrphans/>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true }}
      <span class="one">One</span>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    this.set('t1', function* ({ removedSprites }) {
      assert.strictEqual(removedSprites.length, 1, 'second transition');
    });

    this.set('showIt', false);
    await animationsSettled();
  });

  test('it runs all orphan transitions in parallel', async function (assert) {
    assert.expect(4);
    this.set('showIt', true);
    await render(hbs`
  <AnimatedOrphans/>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true}}
      <span class="one">One</span>
    {{/animated-value}}
    {{#animated-value "two" use=t2 finalRemoval=true}}
      <span class="two">Two</span>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    let unblock1, unblock2;

    this.set('t1', function* ({ removedSprites }) {
      assert.strictEqual(removedSprites.length, 1, 't1');
      yield new Promise((r) => (unblock1 = r));
    });

    this.set('t2', function* ({ removedSprites }) {
      assert.strictEqual(removedSprites.length, 1, 't2');
      yield new Promise((r) => (unblock2 = r));
    });

    this.set('showIt', false);
    await wait();
    assert.ok(unblock1, 'unblock1');
    assert.ok(unblock2, 'unblock2');
    unblock1();
    unblock2();
    await animationsSettled();
  });

  test('it places orphan sprite at correct bounds', async function (assert) {
    assert.expect(2);

    this.set('showIt', true);
    await render(hbs`
  {{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
  <div style="position: fixed; top: 0px; left: 0px">
   <AnimatedOrphans/>
  </div>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true}}
      <div class="one">One</div>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    let firstBounds = this.element
      .querySelector('.one')
      .getBoundingClientRect();

    this.set('t1', function* ({ removedSprites }) {
      assert.strictEqual(removedSprites.length, 1, 'second transition');
      testMotion(removedSprites[0]);
      assert.equalBounds(
        firstBounds,
        removedSprites[0].element.getBoundingClientRect(),
      );
    });

    this.set('showIt', false);
    await animationsSettled();
  });

  test('it preserves copied CSS properties on orphans', async function (assert) {
    assert.expect(1);

    this.set('showIt', true);
    await render(hbs`
  {{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
  <div style="position: fixed; top: 0px; left: 0px">
   <AnimatedOrphans/>
  </div>

  {{#if showIt}}
    <div style="color: rgb(12, 34, 56)">
    {{#animated-value "one" use=t1 finalRemoval=true}}
      <div class="one">One</div>
    {{/animated-value}}
    </div>
  {{/if}}
  `);
    await animationsSettled();

    this.set('t1', function* ({ removedSprites }) {
      testMotion(removedSprites[0]);
      assert.strictEqual(
        getComputedStyle(removedSprites[0].element).color,
        'rgb(12, 34, 56)',
      );
    });

    this.set('showIt', false);
    await animationsSettled();
  });

  test('makes orphan sprites eligible for far matching back into other animators', async function (assert) {
    assert.expect(15);

    this.set('showIt', true);

    await render(hbs`
  {{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
  <div style="position: fixed; top: 0px; left: 0px">
   <AnimatedOrphans/>
  </div>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true}}
      <div class="one">One</div>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    let counter = 0;

    // This transition will run twice. First when the orphaned sprite is
    // animated as a removedSprite, and then when that is interrupted,
    // again with the orphaned sprite as a sentSprite.
    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        counter++;
        if (counter === 1) {
          assert.strictEqual(removedSprites.length, 1, 'first removed');
          assert.strictEqual(sentSprites.length, 0, 'first second');
        } else if (counter === 2) {
          assert.strictEqual(
            removedSprites.length,
            0,
            'second removed, old sprite',
          );
          assert.strictEqual(sentSprites.length, 1, 'second sent, old sprite');
        } else {
          assert.ok(false, 'should only run twice');
        }
        assert.strictEqual(
          keptSprites.length,
          0,
          'both times kept, old sprite',
        );
        assert.strictEqual(
          insertedSprites.length,
          0,
          'both times inserted, old sprite',
        );
        assert.strictEqual(
          receivedSprites.length,
          0,
          'both times received, old sprite',
        );
        removedSprites.forEach((s) => testMotion(s, { shouldBlock: true }));
      },
    );

    this.set('showIt', false);
    await wait();

    // This will first concurrently with the second run of the
    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        assert.strictEqual(
          removedSprites.length,
          0,
          'second removed, new sprite',
        );
        assert.strictEqual(keptSprites.length, 0, 'second kept, new sprite');
        assert.strictEqual(
          insertedSprites.length,
          0,
          'second inserted, new sprite',
        );
        assert.strictEqual(sentSprites.length, 0, 'second sent, new sprite');
        assert.strictEqual(
          receivedSprites.length,
          1,
          'second received, new sprite',
        );
        keptSprites.forEach(testMotion);
      },
    );
    this.set('showIt', true);
    await animationsSettled();
  });

  test('drops sprites that had not started animating when interruption occured', async function (assert) {
    assert.expect(20);
    this.set('showIt', true);
    await render(hbs`
  {{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
  <div style="position: fixed; top: 0px; left: 0px">
   <AnimatedOrphans/>
  </div>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true }}
      <div class="one">One</div>
    {{/animated-value}}
    {{#animated-value "two" use=t2 finalRemoval=true }}
      <div class="one">One</div>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    let t1Counter = 0;

    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        t1Counter++;

        if (t1Counter === 1) {
          assert.strictEqual(
            removedSprites.length,
            1,
            `t1 removed ${t1Counter}`,
          );
          assert.strictEqual(sentSprites.length, 0, `t1 sent ${t1Counter}`);
        } else if (t1Counter === 2) {
          assert.strictEqual(
            removedSprites.length,
            0,
            `t1 removed ${t1Counter}`,
          );
          assert.strictEqual(sentSprites.length, 1, `t1 sent ${t1Counter}`);
        } else {
          assert.ok(false, 'should t1 only run twice');
        }

        assert.strictEqual(keptSprites.length, 0, `t1 kept ${t1Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t1 inserted ${t1Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          0,
          `t1 received ${t1Counter}`,
        );

        removedSprites.forEach((s) => testMotion(s, { shouldBlock: true }));
      },
    );

    let t2Counter = 0;

    this.set(
      't2',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        t2Counter++;

        if (t2Counter === 1) {
          assert.strictEqual(
            removedSprites.length,
            1,
            `t2 removed ${t2Counter}`,
          );
          assert.strictEqual(sentSprites.length, 0, `t2 sent ${t2Counter}`);
        } else {
          assert.ok(false, 'should t2 only run once');
        }
        assert.strictEqual(keptSprites.length, 0, `t2 kept ${t2Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t2 inserted ${t2Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          0,
          `t2 received ${t2Counter}`,
        );
      },
    );

    this.set('showIt', false);
    await wait(); // fixme timecontrols instead

    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        let t1Counter = 3;
        assert.strictEqual(removedSprites.length, 0, `t1 removed ${t1Counter}`);
        assert.strictEqual(sentSprites.length, 0, `t1 sent ${t1Counter}`);
        assert.strictEqual(keptSprites.length, 0, `t1 kept ${t1Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t1 inserted ${t1Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          1,
          `t1 received ${t1Counter}`,
        );
      },
    );

    this.set('t2', function* () {
      assert.ok(false, 't2 run 3 is not supposed to transition');
    });

    this.set('showIt', true);
    await animationsSettled();
  });

  test('drops sprites that finished animating when interruption occured', async function (assert) {
    assert.expect(20);

    this.set('showIt', true);
    await render(hbs`
  {{! this is fixed because it's not supposed to move during animations, but the QUnit test harness is appending test results above us }}
  <div style="position: fixed; top: 0px; left: 0px">
   <AnimatedOrphans/>
  </div>

  {{#if showIt}}
    {{#animated-value "one" use=t1 finalRemoval=true }}
      <div class="one">One</div>
    {{/animated-value}}
    {{#animated-value "two" use=t2 finalRemoval=true  }}
      <div class="one">One</div>
    {{/animated-value}}
  {{/if}}
  `);
    await animationsSettled();

    let t1Counter = 0;

    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        t1Counter++;

        if (t1Counter === 1) {
          assert.strictEqual(
            removedSprites.length,
            1,
            `t1 removed ${t1Counter}`,
          );
          assert.strictEqual(sentSprites.length, 0, `t1 sent ${t1Counter}`);
        } else if (t1Counter === 2) {
          assert.strictEqual(
            removedSprites.length,
            0,
            `t1 removed ${t1Counter}`,
          );
          assert.strictEqual(sentSprites.length, 1, `t1 sent ${t1Counter}`);
        } else {
          assert.ok(false, 'should t1 only run twice');
        }

        assert.strictEqual(keptSprites.length, 0, `t1 kept ${t1Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t1 inserted ${t1Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          0,
          `t1 received ${t1Counter}`,
        );

        removedSprites.forEach((s) => testMotion(s, { shouldBlock: true }));
      },
    );

    let t2Counter = 0;

    this.set(
      't2',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        t2Counter++;

        if (t2Counter === 1) {
          assert.strictEqual(
            removedSprites.length,
            1,
            `t2 removed ${t2Counter}`,
          );
          assert.strictEqual(sentSprites.length, 0, `t2 sent ${t2Counter}`);
        } else {
          assert.ok(false, 'should t2 only run once');
        }
        assert.strictEqual(keptSprites.length, 0, `t2 kept ${t2Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t2 inserted ${t2Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          0,
          `t2 received ${t2Counter}`,
        );

        removedSprites.forEach((s) => testMotion(s, { shouldBlock: false }));
      },
    );

    this.set('showIt', false);
    await wait();

    this.set(
      't1',
      function* ({
        insertedSprites,
        keptSprites,
        removedSprites,
        sentSprites,
        receivedSprites,
      }) {
        let t1Counter = 3;
        assert.strictEqual(removedSprites.length, 0, `t1 removed ${t1Counter}`);
        assert.strictEqual(sentSprites.length, 0, `t1 sent ${t1Counter}`);
        assert.strictEqual(keptSprites.length, 0, `t1 kept ${t1Counter}`);
        assert.strictEqual(
          insertedSprites.length,
          0,
          `t1 inserted ${t1Counter}`,
        );
        assert.strictEqual(
          receivedSprites.length,
          1,
          `t1 received ${t1Counter}`,
        );
      },
    );

    this.set('t2', function* () {
      assert.ok(false, 't2 third time should not transition');
    });

    this.set('showIt', true);
    await animationsSettled();
  });
});
