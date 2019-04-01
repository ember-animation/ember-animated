import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import fade from 'ember-animated/transitions/fade';
import { computed } from '@ember/object';
import { wait } from 'ember-animated';
import  { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';

export default Controller.extend({

  guests: 1,

  init() {
    this._super(...arguments);
    this.codeTransition = this.codeTransition.bind(this);
  },

  fade,
  crossFade: function*({ insertedSprites, removedSprites, keptSprites }) {
    insertedSprites.concat(keptSprites).forEach(fadeIn);
    removedSprites.forEach(fadeOut);
  },

  transition: fade,

  // originalTemplate: `
  //   {{#each guests}}
  //     {{fa-icon 'user'}}
  //   {{/each}}
  // `,
  //
  // animatedTemplate: `
  //   {{#animated-each guests use=transition}}
  //     {{fa-icon 'user'}}
  //   {{/animated-each}}
  // `,

  originalTemplateLines: Object.freeze([
    { id: 'original-1', text: "{{#each guests}}" },
    { id: 'both-1', text: "  {{fa-icon 'user'}}" },
    { id: 'original-2', text: "{{/each}}" },
  ]),

  animatedTemplateLines: Object.freeze([
    { id: 'animated-1', text: "{{#animated-each guests use=transition}}" },
    { id: 'both-1', text: "  {{fa-icon 'user'}}" },
    { id: 'animated-2', text: "{{/animated-each}}" },
  ]),

  templateLines: dedent`
    - {{#each guests}}
    + {{#animated-each guests use=transition}}
        {{fa-icon 'user'}}
    - {{/each}}
    + {{/animated-each}}
  `,

  componentDiff: dedent`
      import Component from '@ember/component';
    + import fade from 'ember-animated/transitions/fade';

      export default Component.extend({
    +   transition: fade,
    +
        guests: 1,

        actions: {
          addGuest() {
            if (this.guests < 6) {
              this.incrementProperty('guests');
            }
          },

          removeGuest() {
            if (this.guests > 1) {
              this.decrementProperty('guests');
            }
          }
        }
      });
  `,

  originalComponentLines: computed(function() {
    let lineObjects = getLineObjectsFromDiff(this.componentDiff, 'before');

    return highlightLineObjects(lineObjects);
  }),

  finalComponentLines: computed(function() {
    let diffLines = this.componentDiff.split('\n');
    let lineObjects = diffLines.map((diff, index) => {
      return {
        index,
        text: diff
      };
    });

    let { keptLines, addedLines } = groupedLines(lineObjects);
    let lines = keptLines.concat(addedLines).sort((a, b) => a.index - b.index);

    return highlightLineObjects(lines);
  }),

  codeTransition: function*({ duration, insertedSprites, removedSprites, keptSprites }) {
    if (this.isAnimating) {
      removedSprites.forEach(fadeOut);

      // yield wait(duration);

      // Need to set inserted sprites to 0 opacity in case their animation is interrupted
      insertedSprites.forEach(sprite => {
        sprite.applyStyles({
          opacity: '0'
        });
      });

      keptSprites.map(sprite => {
        fadeIn(sprite);
        move(sprite);
      });

      yield wait(duration);

      // for (let sprite of insertedSprites) {
      // }

      for (let sprite of insertedSprites) {
        sprite.moveToFinalPosition();
        sprite.applyStyles({
          overflow: 'hidden',
          opacity: '1',
          display: 'inline-block',
          width: 'auto'
        });
        // debugger;
        let totalWidth = sprite.element.getBoundingClientRect().width;
        let chars = sprite.element.textContent;
        let characterWidth = totalWidth / chars.length;

        sprite.reveal();

        for (var i = 0; i < chars.length; i++) {
          sprite.applyStyles({
            width: characterWidth * (i + 1)
          });

          if (chars[i] !== " ") {
            yield wait(15);
          }
        }
      }

    } else {
      removedSprites.forEach(fadeOut);
      keptSprites.map(sprite => {
        fadeIn(sprite);
        move(sprite);
      });
      insertedSprites.forEach(fadeIn);
    }
  },

  // * transition({ insertedSprites, keptSprites, removedSprites }) {
  //   insertedSprites.forEach(sprite => {
  //     debugger;
  //     // sprite.startTranslatedBy(0, -10);
  //     sprite.applyStyles({
  //       opacity: 0
  //
  //     });
  //     debugger;
  //     // sprite.scale(0.8, 0.8);
  //     fadeIn(sprite);
  //     // scale(sprite);
  //     move(sprite);
  //   });
  //
  //   keptSprites.forEach(sprite => {
  //     fadeIn(sprite);
  //     move(sprite);
  //   });
  //
  //   removedSprites.forEach(sprite => {
  //     sprite.endTranslatedBy(10, 0);
  //     fadeOut(sprite);
  //     move(sprite);
  //   });
  // },

  actions: {
    addGuest() {
      if (this.guests < 6) {
        this.incrementProperty('guests');
      }
    },

    removeGuest() {
      if (this.guests > 1) {
        this.decrementProperty('guests');
      }
    }
  }

});

function dedent(strings) {
  // $FlowFixMe: Flow doesn't undestand .raw
  var raw = typeof strings === "string" ? [strings] : strings.raw;

  // first, perform interpolation
  var result = "";
  for (var i = 0; i < raw.length; i++) {
    result += raw[i].
    // join lines when there is a suppressed newline
    replace(/\\\n[ \t]*/g, "").

    // handle escaped backticks
    replace(/\\`/g, "`");

    if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
      result += arguments.length <= i + 1 ? undefined : arguments[i + 1];
    }
  }

  // now strip indentation
  var lines = result.split("\n");
  var mindent = null;
  lines.forEach(function (l) {
    var m = l.match(/^(\s+)\S+/);
    if (m) {
      var indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    (function () {
      var m = mindent; // appease Flow
      result = lines.map(function (l) {
        return l[0] === " " ? l.slice(m) : l;
      }).join("\n");
    })();
  }

  return result.
  // dedent eats leading and trailing whitespace too
  trim().
  // handle escaped newlines at the end to ensure they don't get stripped too
  replace(/\\n/g, "\n");
}

function groupedLines(lineObjects) {
  let keptLines = [];
  let removedLines = [];
  let addedLines = [];

  lineObjects.forEach((lineObject, index) => {
    if (lineObject.text.indexOf('+') === 0) {
      lineObject.id = `added-${index}`;
      lineObject.text = lineObject.text
        .replace('+', ' ')
        .replace(/^\s\s/, ""); // remove the 2-space indent

      addedLines.push(lineObject);

    } else if (lineObject.text.indexOf('-') === 0) {
      lineObject.id = `removed-${index}`;
      lineObject.text = lineObject.text
        .replace('-', ' ')
        .replace(/^\s\s/, ""); // remove the 2-space indent

      removedLines.push(lineObject);
    } else {
      lineObject.id = `kept-${index}`;
      lineObject.text = lineObject.text
        .replace(/^\s\s/, ""); // remove the 2-space indent

      keptLines.push(lineObject);
    }
  });

  return { keptLines, removedLines, addedLines };
}

function highlightLineObjects(lineObjects) {
  let code = lineObjects.map(lineObject => lineObject.text).join('\n');
  let highlightedCode = highlightCode(code, 'js');

  return highlightedCode.split('\n').map((text, index) => ({
    id: lineObjects[index].id,
    text: text === "" ? "\n" : text
  }));
}

function getOriginalLineObjectsFromDiff(diff, beforeOrAfter) {
  let diffLines = diff.split('\n');
  let lineObjects = diffLines.map((diff, index) => {
    return {
      index,
      text: diff
    };
  });

  let { keptLines, removedLines } = groupedLines(lineObjects);

  if (beforeOrAfter === 'before') {
  }

  return keptLines.concat(removedLines).sort((a, b) => a.index - b.index);
}
