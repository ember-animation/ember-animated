import { computed } from '@ember/object';
import Component from '@ember/component';
import { wait } from 'ember-animated';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.codeTransition = this.codeTransition.bind(this);
  },

  onAnimationChange() {},

  originalLines: linesFromDiff('diff', 'before'),
  finalLines: linesFromDiff('diff', 'after'),

  activeLines: computed('isShowingFinal', function() {
    return this.isShowingFinal ? this.finalLines : this.originalLines;
  }),

  codeTransition: function*({ duration, insertedSprites, removedSprites, keptSprites }) {
    this.incrementProperty('transitionsRunning');
    this.set('isAnimatingInsertedLines', false);

    if (this.isShowingFinal) {
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

      // this.set('isAnimatingInsertedLines', false);
      this.onAnimationChange(false);

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
});

function linesFromDiff(diffProperty, beforeOrAfter) {
  return computed(function() {
    let lineObjects = getLineObjectsFromDiff(this[diffProperty], beforeOrAfter);
    let language = this.label.substr(this.label.lastIndexOf('.') + 1);

    return highlightLineObjects(lineObjects, language);
  });
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
