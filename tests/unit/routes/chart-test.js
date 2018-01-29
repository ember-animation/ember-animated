import { moduleFor, test } from 'ember-qunit';

moduleFor('route:chart', 'Unit | Route | chart', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', async function(assert) {
  let route = this.subject();
  let m = await route.model();
  assert.equal(m.length, 20176);
});
