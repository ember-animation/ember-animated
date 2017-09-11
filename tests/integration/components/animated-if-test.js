import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('animated-if', 'Integration | Component | animated if', {
  integration: true
});

test('it renders when true', function(assert) {
  this.set('x', true);
  this.render(hbs`
    {{#animated-if x}}
      <div class="truthy"></div>
    {{/animated-if}}
  `);
  assert.equal(this.$('.truthy').length, 1);
});

test('it does not render when false', function(assert) {
  this.render(hbs`
    {{#animated-if x}}
      <div class="truthy"></div>
    {{/animated-if}}
  `);
  assert.equal(this.$('.truthy').length, 0);
});

test('it renders inverse block when false', function(assert) {
  this.render(hbs`
    {{#animated-if x}}
      <div class="truthy"></div>
    {{else}}
      <div class="falsey"></div>
    {{/animated-if}}
  `);
  assert.equal(this.$('.falsey').length, 1);
});
