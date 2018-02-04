import { moduleFor, test } from 'ember-qunit';

moduleFor('route:chart', 'Unit | Route | chart', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

test('it exists', async function(assert) {
  let route = this.subject();
  let model = await route.model();
  assert.equal(model.length, 15475);
});

test('expected properties - Chile', async function(assert) {
  let route = this.subject();
  let model = await route.model();
  let row = model.find(line => line.countryYear === "Chile 1900")
  assert.equal(row.population, 2981489);
});

// test('expected properties - Iceland', async function(assert) {
//   let route = this.subject();
//   let model = await route.model();
//   assert.equal(model[7918].gdp, 25356);
//   assert.equal(model[7918].life, 77.71);
// });

// test('expected properties - Sint Maarten', async function(assert) {
//   let route = this.subject();
//   let model = await route.model();
//   assert.equal(model[20112].countryYear, "Sint Maarten (Dutch part) 1952");
//   assert.equal(model[20112].population, 1799);
// });
