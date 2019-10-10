import { skip, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { bounds, time, setupAnimationTest } from 'ember-animated/test-support';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Beacon Demo', function(hooks){
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  skip('visiting /between-components', async function(assert) {
    await this.render(hbs`
      {{between-components}}
    `);
    await time.pause();
    await click(this.element.querySelector('button'));
    await time.advance(100);
    let modal = bounds(this.element.querySelector('.message'));
    let button = bounds(this.element.querySelector('button'));
    assert.closeBounds(5, modal, button, 'modal should be near button');
  });


});

