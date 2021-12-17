import { computed } from '@ember/object';
import Component from '@ember/component';
import { wait } from 'ember-animated';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.codeTransition = this.codeTransition.bind(this);
  },

  onAnimationChange() {},

  originalLines: linesFromDiff('diff', 'before'),
  finalLines: linesFromDiff('diff', 'after'),

  activeLines: computed('isShowingFinal', function () {
    return this.isShowingFinal ? this.finalLines : this.originalLines;
  }),

  codeTransition: function* ({
    duration,
    insertedSprites,
    removedSprites,
    keptSprites,
  }) {
    this.incrementProperty('transitionsRunning');
    this.set('isAnimatingInsertedLines', false);

    if (this.isShowingFinal) {
      removedSprites.forEach(fadeOut);

      // Need to set inserted sprites to 0 opacity in case their animation is interrupted
      insertedSprites.forEach((sprite) => {
        sprite.applyStyles({
          opacity: '0',
        });
      });

      keptSprites.map((sprite) => {
        fadeIn(sprite);
        move(sprite);
      });

      yield wait(duration);

      while (this.animationPaused) {
        yield wait(100);
      }

      // this.set('isAnimatingInsertedLines', true);
      this.onAnimationChange(true);

      for (let sprite of insertedSprites) {
        sprite.moveToFinalPosition();
        sprite.applyStyles({
          overflow: 'hidden',
          opacity: '1',
          display: 'inline-block',
          width: 'auto',
        });

        let totalWidth = sprite.element.getBoundingClientRect().width;
        let chars = sprite.element.textContent;
        let characterWidth = totalWidth / chars.length;

        sprite.reveal();

        for (let i = 0; i < chars.length; i++) {
          sprite.applyStyles({
            width: `${characterWidth * (i + 1)}`,
          });

          if (chars[i] !== ' ') {
            yield wait(15);
          }
        }
      }

      // this.set('isAnimatingInsertedLines', false);
      this.onAnimationChange(false);
    } else {
      removedSprites.forEach(fadeOut);
      keptSprites.map((sprite) => {
        fadeIn(sprite);
        move(sprite);
      });
      insertedSprites.forEach(fadeIn);
    }

    this.decrementProperty('transitionsRunning');
  },
});

function linesFromDiff(diffProperty, beforeOrAfter) {
  return computed(function () {
    let lineObjects = getLineObjectsFromDiff(this[diffProperty], beforeOrAfter);
    let language = this.label.substr(this.label.lastIndexOf('.') + 1);

    return highlightLineObjects(lineObjects, language);
  });
}

function highlightLineObjects(lineObjects, language) {
  let code = lineObjects.map((lineObject) => lineObject.text).join('\n');
  let highlightedCode = highlightCode(code, language);

  return highlightedCode.split('\n').map((text, index) => ({
    id: lineObjects[index].id,
    highlighted: lineObjects[index].highlighted,
    // htmlSafe is justified here because we generated the highlighting markup
    // ourself in highlightCode
    text: htmlSafe(text === '' ? '\n' : text),
  }));
}

function getLineObjectsFromDiff(diff, beforeOrAfter) {
  let diffLines = diff.split('\n');
  let lineObjects = diffLines.map((diff, index) => {
    return {
      index,
      text: diff,
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

function groupedLines(lineObjects) {
  let isAddedLine = (lineObject) => lineObject.text.indexOf('+') === 0;
  let isRemovedLine = (lineObject) => lineObject.text.indexOf('-') === 0;
  let isModifiedLine = (lineObject) =>
    isAddedLine(lineObject) || isRemovedLine(lineObject);
  let hasAddedOrRemovedLines = lineObjects.filter(isModifiedLine).length > 0;

  return lineObjects
    .map((lineObject, index) => {
      if (isAddedLine(lineObject)) {
        lineObject.id = `added-${index}`;
        lineObject.text = lineObject.text.replace('+', ' ');
        lineObject.highlighted = true;
      } else if (isRemovedLine(lineObject)) {
        lineObject.id = `removed-${index}`;
        lineObject.text = lineObject.text.replace('-', ' ');
        // .replace(/^\s\s/, ""); // remove the 2-space indent
      } else {
        lineObject.id = `kept-${index}`;
      }

      return lineObject;
    })
    .map((lineObject) => {
      /*
      If we have either addded or removed lines, all text has a 2-space indent
      right now, so we remove it.

      If we don't, we don't need to dedent anything, because all space was
      dedented by the `dedent` function when the diff was originally passed in.
    */
      if (hasAddedOrRemovedLines) {
        lineObject.text = lineObject.text.replace(/^\s\s/, '');
      }

      return lineObject;
    })
    .reduce(
      (groupedLines, lineObject) => {
        let type = lineObject.id.split('-')[0];
        groupedLines[`${type}Lines`].push(lineObject);

        return groupedLines;
      },
      { keptLines: [], removedLines: [], addedLines: [] },
    );
}
