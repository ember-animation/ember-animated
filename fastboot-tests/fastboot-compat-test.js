const FastBoot = require('fastboot');
const { execFileSync } = require('child_process');
const { module: Qmodule, test } = require('qunitjs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

Qmodule('Fastboot', function(hooks) {
  let fastboot;

  hooks.before(async function() {
    execFileSync('node', ['./node_modules/.bin/ember', 'build']);
    fastboot = new FastBoot({
      distPath: 'dist',
      resilient: false,
    });
  });

  hooks.beforeEach(async function(assert) {
    let visitOpts = {
      request: { headers: { host: 'localhost:4200' } },
    };
    this.visitAndAssert = async url => {
      let page = await fastboot.visit(url, visitOpts);
      assert.equal(page.statusCode, 200, `Expected status 200 for ${url}`);
      let html = await page.html();
      return {
        get dom() {
          return new JSDOM(html);
        },
      };
    };
  });

  test('renders /demos/each', async function(assert) {
    assert.expect(2);
    let { dom } = await this.visitAndAssert('/demos/each');
    assert.ok(
      /This is after the list/.test(
        dom.window.document.querySelector('.scenario-each').textContent,
      ),
    );
  });

  test('renders /demos/orphan', async function(assert) {
    assert.expect(3);
    let { dom } = await this.visitAndAssert('/demos/orphan');
    assert.ok(dom.window.document.querySelector('.one'), 'found one');
    assert.ok(dom.window.document.querySelector('.two'), 'found two');
  });

  for (let url of [
    'container-only',
    'two-lists',
    'swapping-lists',
    'bind',
    'hero',
    'nested',
    'direct-style',
    'inline-text',
    'here-there',
    'svg',
    'beacon',
    'ifdemo',
    'eachdemo',
    'valuedemo',
    'containerdemo',
    'modal',
    'sandbox',
    'color-and-shadow',
  ]) {
    test(`smoke test ${url}`, async function() {
      await this.visitAndAssert(`/demos/${url}`);
    });
  }
});
