import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupAnimationTest, time, animationsSettled, bounds as _bounds } from 'ember-animated/test-support';
import resize from 'ember-animated/motions/resize';

module('Integration | Component | animated if', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders when true', async function(assert) {
    this.set('x', true);
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.ok(this.element.querySelector('.truthy'));
  });

  test('it does not render when false', async function(assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{/animated-if}}
    `);
    assert.notOk(this.element.querySelector('.truthy'));
  });

  test('it renders inverse block when false', async function(assert) {
    await render(hbs`
      {{#animated-if x}}
        <div class="truthy"></div>
      {{else}}
        <div class="falsey"></div>
      {{/animated-if}}
    `);
    assert.ok(this.element.querySelector('.falsey'));
  });
});

module('Integration | Component | animated if', function(hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  function *transition({ insertedSprites, removedSprites, keptSprites }) {
    insertedSprites.forEach(sprite => {
      resize(sprite, { fromHeight: 0 });
    });
    removedSprites.forEach(sprite => {
      resize(sprite, { toHeight: 0 });
    });
    keptSprites.forEach(sprite => {
       // this one needs no args because it already has a natural
       // initial and final size. This case comes up if you interrupt
       // a running animation.
       resize(sprite);
    });
  }

  test('can be used to resize elements that do not exist in the DOM when false', async function(assert) {
    this.set('transition', transition)
    await this.render(hbs`
      <AnimatedContainer>
        {{#animated-if showThing use=transition duration=5000}}
          <div style="overflow-y: hidden">Content</div>
        {{/animated-if}}
      </AnimatedContainer>
    `);

    await animationsSettled();
    let start = _bounds(this.element.querySelector('.animated-container'));
    time.pause();
    this.set('showThing', true);
    // todo: test pauses indefinitely on this and fails. If this line is removed, the "Content" seems to never appear
    await animationsSettled();
    await time.advance(500);
    let midpoint = _bounds(this.element.querySelector('.animated-container'));
    await time.advance(500);
    let end = _bounds(this.element.querySelector('.animated-container'));
    assert(start.height < midpoint.height && midpoint.height < end.height);
  });
});
