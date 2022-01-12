/* eslint-disable ember/no-classic-classes,ember/require-super-in-lifecycle-hooks */
import { Promise as EmberPromise } from 'rsvp';
import { run } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { equalBounds, visuallyConstant } from '../../helpers/assertions';
import { task } from 'ember-animated/-private/ember-scheduler';
import { current } from 'ember-animated/-private/scheduler';
import { Motion, afterRender, wait } from 'ember-animated';
import {
  setupAnimationTest,
  time,
  animationsSettled,
  bounds as _bounds,
} from 'ember-animated/test-support';

module('Integration | Component | animated container', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (assert) {
    assert.equalBounds = equalBounds;
    assert.visuallyConstant = visuallyConstant;
    let here = this;

    this.owner.register(
      'component:fake-animator',
      Component.extend({
        motionService: service('-ea-motion'),
        init() {
          this._super();
          here.set('fakeAnimator', this);
          this.get('motionService').register(this);
        },
        willDestroyElement() {
          this.get('motionService').unregister(this);
        },
        didInsertElement() {
          if (this.onInitialRender) {
            this.get('animate').perform(this.onInitialRender);
          }
        },
        beginStaticMeasurement() {
          this.element.style.height = this.staticHeight + 'px';
        },
        endStaticMeasurement() {
          this.element.style.height = this.staticHeight + 'px';
        },
        isAnimating: alias('animate.isRunning'),
        animate: task(function* (opts = {}) {
          // In a typical well-behaved animation, the static height *is*
          // the final height. But we distinguish the two here in order
          // to make it easier to observe the effect of the container
          // unlocking itself.

          this.initialHeight =
            opts.initialHeight == null ? 0 : opts.initialHeight;
          this.staticHeight =
            opts.staticHeight == null ? 100 : opts.staticHeight;
          this.finalHeight = opts.finalHeight == null ? 200 : opts.finalHeight;

          this.element.style.height = this.initialHeight + 'px';
          let service = this.get('motionService');
          service.willAnimate({
            duration: opts.duration == null ? 1 : opts.duration,
            task: current(),
            component: this,
          });
          yield afterRender();
          yield* service.staticMeasurement(() => {});
          this.element.style.height = this.finalHeight + 'px';
          if (opts.block) {
            yield opts.block;
          }
        }),
      }),
    );
  });

  test('simple render', async function (assert) {
    await render(hbs`
      <AnimatedContainer>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    this.element.querySelector('.inside').style.height = '210px';

    let container = _bounds(this.element.querySelector('.animated-container'));
    let inside = _bounds(this.element.querySelector('.inside'));
    assert.equalBounds(container, inside, 'takes size of content');

    this.element.querySelector('.inside').style.height = '600px';

    container = _bounds(this.element.querySelector('.animated-container'));
    let tallerInside = _bounds(this.element.querySelector('.inside'));
    assert.equalBounds(container, tallerInside, 'adapts to height of content');
    assert.ok(tallerInside.height > inside.height, 'inside content got taller');
  });

  test('locks size', async function (assert) {
    await render(hbs`
      <AnimatedContainer>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);
    this.element.querySelector('.inside').style.height = '210px';

    let original = _bounds(this.element.querySelector('.animated-container'));

    run(() => {
      this.get('fakeAnimator.animate').perform();
    });

    this.element.querySelector('.inside').style.height = '600px';

    let final = _bounds(this.element.querySelector('.animated-container'));

    assert.equalBounds(final, original, 'height can be locked');
  });

  test('measures at the appropriate time', async function (assert) {
    let motionSawHeight;

    this.set(
      'TestMotion',
      class extends Motion {
        *animate() {
          motionSawHeight = this.sprite.finalBounds.height;
        }
      },
    );

    await render(hbs`
      <AnimatedContainer @motion={{TestMotion}}>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    run(() => {
      this.get('fakeAnimator.animate').perform({
        staticHeight: 321,
      });
    });

    await animationsSettled();
    assert.strictEqual(motionSawHeight, 321);
  });

  test('unlocks only after own motion is done', async function (assert) {
    let finishMotion;
    let startMotion;
    let startedMotion = new EmberPromise((resolve) => (startMotion = resolve));

    this.set(
      'TestMotion',
      class extends Motion {
        *animate() {
          startMotion();
          yield new EmberPromise((resolve) => {
            finishMotion = resolve;
          });
        }
      },
    );

    await render(hbs`
      <AnimatedContainer @motion={{TestMotion}}>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    run(() => {
      this.get('fakeAnimator.animate').perform({
        initialHeight: 100,
        staticHeight: 200,
        finalHeight: 300,
      });
    });
    await startedMotion;
    assert.strictEqual(
      height(this.element.querySelector('.animated-container')),
      100,
      'still at previous height',
    );
    finishMotion();
    await animationsSettled();
    assert.strictEqual(
      height(this.element.querySelector('.animated-container')),
      300,
      'now at final height',
    );
  });

  test("unlocks only after animator's motion is done", async function (assert) {
    let unblock;
    let block = new EmberPromise((resolve) => (unblock = resolve));

    await render(hbs`
      <AnimatedContainer>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    run(() => {
      this.get('fakeAnimator.animate').perform({
        block,
        initialHeight: 100,
        staticHeight: 200,
        finalHeight: 300,
      });
    });

    await wait(60);
    assert.strictEqual(
      height(this.element.querySelector('.animated-container')),
      200,
      'should be locked at the static height we measured',
    );
    unblock();
    await wait(60);
    assert.strictEqual(
      height(this.element.querySelector('.animated-container')),
      300,
      'unlocked and reflecting the actual final height of the animator',
    );
  });

  test('passes provided duration to motion', async function (assert) {
    let motionOpts;
    this.set(
      'TestMotion',
      class extends Motion {
        *animate() {
          motionOpts = this.opts;
        }
      },
    );

    await render(hbs`
      <AnimatedContainer @motion={{TestMotion}}>
        <div class="inside">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    run(() => {
      this.get('fakeAnimator.animate').perform({
        duration: 456,
      });
    });

    await animationsSettled();
    assert.deepEqual(motionOpts, { duration: 456 });
  });

  test('can animate initial render', async function (assert) {
    assert.expect(3);

    this.set(
      'TestMotion',
      class extends Motion {
        *animate() {
          assert.strictEqual(
            this.sprite.initialBounds.height,
            0,
            'initial height',
          );
          assert.strictEqual(
            this.sprite.finalBounds.height,
            100,
            'static height',
          );
        }
      },
    );

    this.set('opts', {
      initialHeight: 0,
      staticHeight: 100,
      finalHeight: 200,
    });
    await render(hbs`
      <AnimatedContainer @motion={{TestMotion}} @onInitialRender={{true}}>
        {{fake-animator onInitialRender=opts}}
      </AnimatedContainer>
    `);

    await animationsSettled();
    assert.strictEqual(
      height(this.element.querySelector('.animated-container')),
      200,
      'ends up unlocked',
    );
  });

  test('Accounts for top margin collapse between self and child', async function (assert) {
    await render(hbs`
      <AnimatedContainer>
        <div class="inside" style="margin-top: 10px; height: 100px;">
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    assert.visuallyConstant(
      this.element.querySelector('.animated-container'),
      () => {
        run(() => {
          this.get('fakeAnimator.animate').perform();
        });
        this.element.querySelector('.inside').style.position = 'absolute';
      },
    );
  });

  test('Accounts for top margin collapse between self and descendant', async function (assert) {
    await render(hbs`
      <AnimatedContainer>
        <div class="inside">
          <div style="margin-top: 10px; height: 100px;"></div>
          {{fake-animator}}
        </div>
      </AnimatedContainer>
    `);

    assert.visuallyConstant(
      this.element.querySelector('.animated-container'),
      () => {
        run(() => {
          this.get('fakeAnimator.animate').perform();
        });
        this.element.querySelector('.inside').style.position = 'absolute';
      },
    );
  });

  test('Accounts for bottom margin collapse between self and child', async function (assert) {
    await render(hbs`
      <div style="border: 1px solid black">
        <AnimatedContainer>
          <div class="inside" style="margin-bottom: 10px; height: 100px;">
            {{fake-animator}}
          </div>
        </AnimatedContainer>
        <div class="after">This comes after</div>
      </div>
    `);

    assert.visuallyConstant(this.element.querySelector('.after'), () => {
      run(() => {
        this.get('fakeAnimator.animate').perform();
      });
      this.element.querySelector('.inside').style.position = 'absolute';
    });
  });

  test('Accounts for own margin collapse as first content appears', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <style type="text/css">
        .example {
          margin-top: 10px;
          margin-bottom: 20px;
        }
      </style>
      <AnimatedContainer class="example">
        {{fake-animator}}
      </AnimatedContainer>
      <div class="after">This comes after</div>
    `);

    this.get('fakeAnimator').element.style.height = '0px';

    let initialTop = _bounds(this.element.querySelector('.after')).top;

    run(() => {
      this.get('fakeAnimator.animate').perform({
        initialHeight: 0,
        staticHeight: 1,
        finalHeight: 1,
      });
    });

    await animationsSettled();
    assert.strictEqual(
      _bounds(this.element.querySelector('.after')).top,
      initialTop + 1,
      'only changes by one pixel',
    );
  });

  test('Accounts for own margin collapse as last content is removed', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <style type="text/css">
        .example {
          margin-top: 10px;
          margin-bottom: 20px;
        }
      </style>
      <AnimatedContainer class="example">
        {{fake-animator}}
      </AnimatedContainer>
      <div class="after">This comes after</div>
    `);

    this.get('fakeAnimator').element.style.height = '1px';

    let initialTop = _bounds(this.element.querySelector('.after')).top;

    run(() => {
      this.get('fakeAnimator.animate').perform({
        initialHeight: 1,
        staticHeight: 0,
        finalHeight: 0,
      });
    });

    await animationsSettled();
    assert.strictEqual(
      _bounds(this.element.querySelector('.after')).top,
      initialTop - 1,
      'only changes by one pixel',
    );
  });

  test('Uses same timing for measurements as animated-each', async function (assert) {
    assert.expect(2);
    this.set('transition', function* () {});
    this.set(
      'TestMotion',
      class extends Motion {
        *animate() {
          assert.strictEqual(
            this.sprite.initialBounds.height,
            10,
            'initial height',
          );
          assert.strictEqual(
            this.sprite.finalBounds.height,
            20,
            'static height',
          );
        }
      },
    );
    this.set('items', ['a']);
    await render(hbs`
      <AnimatedContainer @motion={{TestMotion}}>
        {{#animated-each items use=transition as |item|}}
          <div style="height: 10px"></div>
        {{/animated-each}}
      </AnimatedContainer>
    `);
    await animationsSettled();
    this.set('items', ['a', 'b']);
    await animationsSettled();
  });

  function height(elt) {
    return _bounds(elt).height;
  }
});

module(
  'Integration | Component | animated container (resize motion)',
  function (hooks) {
    setupRenderingTest(hooks);
    setupAnimationTest(hooks);

    test('has visual continuity at start', async function (assert) {
      this.set('transition', function* () {});
      await render(hbs`
      <AnimatedContainer>
        {{#animated-if showThing use=transition duration=1000}}
          <div>Content</div>
        {{/animated-if}}
      </AnimatedContainer>
    `);
      await animationsSettled();
      let before = _bounds(this.element.querySelector('.animated-container'));
      time.pause();
      this.set('showThing', true);
      await settled();
      await time.advance(10);
      let after = _bounds(this.element.querySelector('.animated-container'));
      assert.closeSize(5, after, before);
    });

    test('has visual continuity at end', async function (assert) {
      this.set('transition', function* () {});
      await render(hbs`
      <AnimatedContainer>
        {{#animated-if showThing use=transition duration=1000}}
          <div>Content</div>
        {{/animated-if}}
      </AnimatedContainer>
    `);
      await animationsSettled();
      time.pause();
      this.set('showThing', true);
      await settled();
      await time.advance(990);
      let before = _bounds(this.element.querySelector('.animated-container'));
      time.runAtSpeed(40);
      await animationsSettled();
      let after = _bounds(this.element.querySelector('.animated-container'));
      assert.closeSize(5, after, before);
    });

    test('has visual continuity at start when inside scaling', async function (assert) {
      this.set('transition', function* () {});
      await render(hbs`
      <div style="transform: scale(0.5)">
        <AnimatedContainer>
          {{#animated-if showThing use=transition duration=1000}}
            <div>Content</div>
          {{/animated-if}}
        </AnimatedContainer>
      </div>
    `);
      await animationsSettled();
      let before = _bounds(this.element.querySelector('.animated-container'));
      time.pause();
      this.set('showThing', true);
      await settled();
      await time.advance(10);
      let after = _bounds(this.element.querySelector('.animated-container'));
      assert.closeSize(5, after, before);
    });

    test('can resize at initial render', async function (assert) {
      this.set('transition', function* () {});
      this.set('showThing', true);
      time.pause();
      await render(hbs`
      <AnimatedContainer @onInitialRender={{true}}>
        {{#animated-if showThing use=transition initialInsertion=true duration=1000}}
          <div style="height: 100px">Content</div>
        {{/animated-if}}
      </AnimatedContainer>
    `);
      await time.advance(10);
      let actual = _bounds(this.element.querySelector('.animated-container'));
      assert.closeSize(5, actual, { width: 0, height: 0 });
    });

    test('accepts splattributes', async function (assert) {
      await render(hbs`
      <AnimatedContainer class="hello world" data-foo="bar"/>
    `);

      let elt = this.element.querySelector('.animated-container');
      assert.dom(elt).hasClass('hello', 'found hello');
      assert.dom(elt).hasClass('world', 'found world');
      assert.strictEqual(elt.dataset['foo'], 'bar');
    });

    test('accepts custom tagName', async function (assert) {
      await render(hbs`
      <AnimatedContainer data-test-me @tagName="section"/>
    `);

      let elt = this.element.querySelector('[data-test-me]');
      assert.strictEqual(elt.tagName, 'SECTION');
    });

    test('accepts a custom tag', async function (assert) {
      await render(hbs`
      <AnimatedContainer @tag="section"/>
    `);

      let elt = this.element.querySelector('.animated-container');
      assert.strictEqual(elt.tagName, 'SECTION');
    });
  },
);
