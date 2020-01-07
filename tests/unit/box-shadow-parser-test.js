import { module, test } from 'qunit';
import { BoxShadow } from 'ember-animated/box-shadow';

module('Unit | BoxShadow', function(hooks) {
  let target;

  hooks.beforeEach(function() {
    let fixture = document.querySelector('#qunit-fixture');
    fixture.innerHTML = `<div class="target"></div>`;
    target = fixture.querySelector('.target');
  });

  function example(authoredShadow, expectedShadows) {
    test('parsing ' + authoredShadow, function(assert) {
      target.style['box-shadow'] = authoredShadow;
      let shadows = BoxShadow.fromComputedStyle(
        getComputedStyle(target)['box-shadow'],
      );
      assert.equal(shadows.length, expectedShadows.length);
      expectedShadows.forEach((expectedShadow, index) => {
        let shadow = shadows[index];
        assert.equal(shadow.x, expectedShadow.x, `shadow ${index} x`);
        assert.equal(shadow.y, expectedShadow.y, `shadow ${index} y`);
        assert.equal(
          shadow.blur,
          expectedShadow.blur || 0,
          `shadow ${index} blur`,
        );
        assert.equal(
          shadow.spread,
          expectedShadow.spread,
          `shadow ${index} spread`,
        );
        assert.equal(
          shadow.inset,
          expectedShadow.inset || false,
          `shadow ${index} inset`,
        );
        assert.equal(shadow.color.r, expectedShadow.r, `shadow ${index} r`);
        assert.equal(shadow.color.g, expectedShadow.g, `shadow ${index} g`);
        assert.equal(shadow.color.b, expectedShadow.b, `shadow ${index} b`);
        assert.equal(
          shadow.color.a,
          expectedShadow.a == null ? 1 : expectedShadow.a,
          `shadow ${index} a`,
        );
      });
    });
  }

  example(`none`, []);
  example(``, []);
  example(`0 0 20px black`, [
    { x: 0, y: 0, blur: 20, spread: 0, r: 0, g: 0, b: 0 },
  ]);
  example(`1px 2px 3px 4px rgba(5, 6, 7, 0.5) inset`, [
    { x: 1, y: 2, blur: 3, spread: 4, r: 5, g: 6, b: 7, a: 0.5, inset: true },
  ]);
  example(`1px 2px 3px 4px rgba(5, 6, 7, 0.5) inset, 0 0 20px black`, [
    { x: 1, y: 2, blur: 3, spread: 4, r: 5, g: 6, b: 7, a: 0.5, inset: true },
    { x: 0, y: 0, blur: 20, spread: 0, r: 0, g: 0, b: 0 },
  ]);
});
