import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { nodeIsInsideComponent } from 'ember-animated/component-containment';

moduleForComponent('component-containment', 'Integration | Utility | component containment', {
  integration: true,
  beforeEach() {
    let self = this;
    this.register('component:test-tagless', Ember.Component.extend({
      tagName: '',
      layout: hbs`{{yield}}`,
      didInsertElement() {
        self.testComponent = this;
      }
    }));
    this.register('component:test-tagged', Ember.Component.extend({
      layout: hbs`{{yield}}`,
      didInsertElement() {
        self.testComponent = this;
      }
    }));

    this.findTextNode = function(t) {
      let node = [...this.$('*').contents()].concat([...this.$().contents()]).find(n => n.nodeType === Node.TEXT_NODE && n.textContent === t);
      if (!node) {
        throw new Error(`failed to locate text node containing ${t}`);
      }
      return node;
    }
  }
});

test('it finds node directly inside tagless componenta', function(assert) {
  this.render(hbs`{{#test-tagless}}QWERTY{{/test-tagless}}`);
  let node = this.findTextNode('QWERTY');
  assert.ok(nodeIsInsideComponent(node, this.testComponent), 'containment check');
});

test('it rejects peer node outside tagless componenta', function(assert) {
  this.render(hbs`{{#test-tagless}}{{/test-tagless}}QWERTY`);
  let node = this.findTextNode('QWERTY');
  assert.ok(!nodeIsInsideComponent(node, this.testComponent), 'containment check');
});

test('it finds node directly inside tagged component', function(assert) {
  this.render(hbs`{{#test-tagged}}QWERTY{{/test-tagged}}`);
  let node = this.findTextNode('QWERTY');
  assert.ok(nodeIsInsideComponent(node, this.testComponent), 'containment check');
});

test('it rejects peer node of tagged component', function(assert) {
  this.render(hbs`{{#test-tagged}}{{/test-tagged}}QWERTY`);
  let node = this.findTextNode('QWERTY');
  assert.ok(!nodeIsInsideComponent(node, this.testComponent), 'containment check');
});

test('it finds node deeply inside tagged component', function(assert) {
  this.render(hbs`{{#test-tagged}}<div><span>QWERTY</span></div>{{/test-tagged}}`);
  let node = this.findTextNode('QWERTY');
  assert.ok(nodeIsInsideComponent(node, this.testComponent), 'containment check');
});

test('it finds node deeply inside tagless component', function(assert) {
  this.render(hbs`{{#test-tagless}}<div><span>QWERTY</span></div>{{/test-tagless}}`);
  let node = this.findTextNode('QWERTY');
  assert.ok(nodeIsInsideComponent(node, this.testComponent), 'containment check');
});
