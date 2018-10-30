import { test, module } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { bounds, time, setupAnimationTest } from 'ember-animated/test-support';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Beacon Demo', function(hooks){
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  test('it renders', async function(assert) {
    await this.render(hbs`
      {{between-components}}
    `);
    assert.ok(this.element.querySelector('button'));
  });


  test('Mail Icon Beacon Generates Emails', async function(assert) {
    await this.render(hbs`
      {{between-components}}
    `);

    await time.pause();
    await click(this.element.querySelector('.top-bar > button'));
    await time.advance(10);

    await time.pause();
    let newEmail = this.element.querySelector('.message');
    let mailBeacon = this.element.querySelector('.top-bar > button');
    assert.closeBounds(5, bounds(mailBeacon), bounds(newEmail), 'new email is near mail icon');

    await time.advance(2000);
    let finalEmails = this.element.querySelectorAll('.each-item');
    assert.equal(finalEmails.length, 8, 'New Email was added to Inbox');
  });

  test('Trash Icon Deletes Email', async function(assert) {
    await this.render(hbs`
      {{between-components}}
    `);
    await time.pause();
    await click(this.element.querySelector('input[type="checkbox"]'));

    await time.advance(2000);
    let finalEmails = this.element.querySelectorAll('.each-item');
    assert.equal(finalEmails.length, 7, 'One Email was Deleted from Inbox');

  });




});


