import Controller from '@ember/controller';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import fade from 'ember-animated/transitions/fade';
import { computed } from '@ember/object';
import { wait } from 'ember-animated';
import { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';
import dedent from './utils/dedent';

export default Controller.extend({

  init() {
    this._super(...arguments);
    this.codeTransition = this.codeTransition.bind(this);
  },

  transitionsRunning: 0,

  guests: 1,

  transition: fade,

  templateDiff: dedent`
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

  originalComponentLines: linesFromDiff('componentDiff', 'before'),
  finalComponentLines: linesFromDiff('componentDiff', 'after'),
  originalTemplateLines: linesFromDiff('templateDiff', 'before'),
  finalTemplateLines: linesFromDiff('templateDiff', 'after'),

  activeTemplateLines: computed('isAnimating', function() {
    return this.isAnimating ? this.finalTemplateLines : this.originalTemplateLines;
  }),

  activeComponentLines: computed('isAnimating', function() {
    return this.isAnimating ? this.finalTemplateLines : this.originalTemplateLines;
  }),

  codeTransition: function*({ duration, insertedSprites, removedSprites, keptSprites }) {
    this.incrementProperty('transitionsRunning');
    this.set('isAnimatingInsertedLines', false);

    if (this.isAnimating) {
      removedSprites.forEach(fadeOut);

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

      while (this.isAnimatingInsertedLines) {
        yield wait(100);
      }

      this.set('isAnimatingInsertedLines', true);

      for (let sprite of insertedSprites) {
        sprite.moveToFinalPosition();
        sprite.applyStyles({
          overflow: 'hidden',
          opacity: '1',
          display: 'inline-block',
          width: 'auto'
        });

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

      this.set('isAnimatingInsertedLines', false);

    } else {
      removedSprites.forEach(fadeOut);
      keptSprites.map(sprite => {
        fadeIn(sprite);
        move(sprite);
      });
      insertedSprites.forEach(fadeIn);
    }

    this.decrementProperty('transitionsRunning');
  },

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
      lineObject.highlighted = true;

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

function highlightLineObjects(lineObjects, language) {
  let code = lineObjects.map(lineObject => lineObject.text).join('\n');
  let highlightedCode = highlightCode(code, language);

  return highlightedCode.split('\n').map((text, index) => ({
    id: lineObjects[index].id,
    highlighted: lineObjects[index].highlighted,
    text: text === "" ? "\n" : text,
  }));
}

function getLineObjectsFromDiff(diff, beforeOrAfter) {
  let diffLines = diff.split('\n');
  let lineObjects = diffLines.map((diff, index) => {
    return {
      index,
      text: diff
    };
  });

  let { keptLines, addedLines, removedLines } = groupedLines(lineObjects);
  let lines;

  if (beforeOrAfter === 'before') {
    lines = keptLines.concat(removedLines).sort((a, b) => a.index - b.index);
  } else if (beforeOrAfter === 'after') {
    lines = keptLines.concat(addedLines).sort((a, b) => a.index - b.index);
  }

  return lines;
}

function linesFromDiff(diffProperty, beforeOrAfter) {
  return computed(function() {
    let lineObjects = getLineObjectsFromDiff(this[diffProperty], beforeOrAfter);
    let language;

    if (diffProperty.indexOf('component') === 0) {
      language = 'js';
    } else if (diffProperty.indexOf('template') === 0) {
      language = 'hbs';
    }

    return highlightLineObjects(lineObjects, language);
  });
}
