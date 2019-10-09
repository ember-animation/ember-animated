import { module, test } from "qunit";
import { visit, currentURL, click, settled } from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";
import {
  setupAnimationTest,
  time,
} from "ember-animated/test-support";

const expectedDuration = 250;

module("Acceptance | smoke", function(hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);

  test("visiting /", async function(assert) {
    function guestElements() {
      return [...document.querySelectorAll("[data-test-guests-demo] .fa-user")];
    }

    function buttonWith(pattern) {
      return [
        ...document.querySelectorAll("[data-test-guests-demo] button"),
      ].find(elt => pattern.test(elt.textContent));
    }

    // load page
    await visit("/");
    assert.equal(currentURL(), "/");

    // try the plus button with animation off
    assert.equal(guestElements().length, 1, "one initial guest");
    await time.pause();
    await click(buttonWith(/\+/));
    await time.advance(expectedDuration / 2);
    assert.equal(guestElements().length, 2, "second guest added");
    assert.equal(
      getComputedStyle(guestElements()[1].parentElement).opacity,
      "1",
      "no animation so full opacity"
    );
    await time.advance(expectedDuration / 2);

    // turn animation on
    await click(buttonWith(/off/i));

    // try the plus button with animation on
    await click(buttonWith(/\+/));
    await time.advance(expectedDuration / 2);
    assert.equal(guestElements().length, 3, "third guest added");
    assert.equal(
      getComputedStyle(guestElements()[2].parentElement).opacity,
      "0.5",
      "half way there"
    );
    await time.advance(expectedDuration / 2);

    // try the minus button with animation off
    await click(buttonWith(/-/));
    await time.advance(expectedDuration / 2);
    assert.equal(guestElements().length, 3, "third guest fading");
    assert.equal(
      getComputedStyle(guestElements()[2].parentElement).opacity,
      "0.5",
      "half way there"
    );
    await time.advance(expectedDuration / 2);
    await settled();
    assert.equal(guestElements().length, 2, "third guest gone");

    // make sure a code snippet is present
    assert.ok(
      [...document.querySelectorAll("[data-test-guests-demo] pre")].find(elt =>
        /<Icon 'user' \/>/.test(elt.textContent)
      ),
      "found Icon snippet content"
    );
  });

  test("step through all /docs pages", async function(assert) {
    await visit("/docs");
    assert.equal(currentURL(), "/docs");
    let count = 0;
    while (true) {
      let nextLink = document.querySelector('[data-test-next-link] > a');
      if (!nextLink) {
        break;
      }
      count++;
      await click(nextLink);
    }
    assert.equal(currentURL(), '/docs/api/modules/ember-animated/transitions/fade', 'last expected page');
    assert.equal(count, 19, 'expected number of docs pages');
  });
});
