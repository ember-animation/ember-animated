import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('animated-bind', 'Integration | Component | animated bind', {
  integration: true
});

test('it renders', function(assert) {
  this.set('value', 'hello');
  this.render(hbs`
    {{#animated-bind value as |v|}}
      <span>{{v}}</span>
    {{/animated-bind}}
  `);

  assert.equal(this.$('span').text().trim(), 'hello');
});
