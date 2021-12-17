/* eslint-disable qunit/no-conditional-assertions */
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  animationsSettled,
  setupAnimationTest,
} from 'ember-animated/test-support';
import { run } from '@ember/runloop';

module('Integration | Component | animated value', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function (assert) {
    this.set('value', 'hello');
    await render(hbs`
      {{#animated-value value as |v|}}
        <span>{{v}}</span>
      {{/animated-value}}
    `);

    assert.dom(this.element.querySelector('span')).hasText('hello');
  });

  test('it animates when a watched property is mutated', async function (assert) {
    assert.expect(5);
    let transitionCounter = 0;
    this.set('item', { id: 'a', x: 1, y: 2 });
    this.set(
      'transition',
      function* ({ insertedSprites, removedSprites, keptSprites }) {
        if (++transitionCounter === 1) {
          assert.strictEqual(keptSprites.length, 1, 'kept sprites');
          assert.strictEqual(insertedSprites.length, 0, 'inserted sprites');
          assert.strictEqual(removedSprites.length, 0, 'removed sprites');
        }
      },
    );

    await render(hbs`
      {{#animated-value item use=transition key="id" watch="x,y" as |item|}}
        <div class="test-child">{{item.id}}</div>
      {{/animated-value}}
    `);

    await animationsSettled();

    run(() => {
      set(this.get('item'), 'y', 3);
    });

    await animationsSettled();

    assert.dom(this.element.querySelector('.test-child')).hasText('a');
    assert.strictEqual(transitionCounter, 1, 'transitionCounter');
  });
});
