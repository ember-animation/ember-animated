import { Motion, rAF, Tween } from 'ember-animated';
import linear from 'ember-animated/easings/linear';
import '../element-remove';

const colorChannels = ['r', 'g', 'b'];
const channels = colorChannels.concat(['a']);

export default function adjustColor(propertyName, sprite, opts) {
  return new AdjustColor(propertyName, sprite, opts).run();
}

adjustColor.property = function(propertyName) {
  return this.bind(null, propertyName);
};

export class AdjustColor extends Motion {
  constructor(propertyName, sprite, opts) {
    super(sprite, opts);
    this.propertyName = propertyName;
    for (let channel of channels) {
      this[`${channel}Tween`] = null;
    }
  }

  *animate() {
    let from, to;

    if (this.opts.from != null) {
      // user-provided choice takes precedence
      from = parseUserProvidedColor(this.opts.from);
    } else if (this.sprite.initialComputedStyle) {
      // otherwise our initial color defaults to the measured initial style
      from = parseComputedColor(this.sprite.initialComputedStyle[this.propertyName]);
    } else {
      // if we don't have a measured initial style, we use the final
      // style. This makes sense in cases where somebody is animating
      // an insertedSprite to an explicit color, and they expect the
      // "from" value to just match the way the sprite will
      // look when it's normal.
      from = parseComputedColor(this.sprite.finalComputedStyle[this.propertyName]);
    }

    if (this.opts.to != null) {
      to = parseUserProvidedColor(this.opts.to);
    } else if (this.sprite.finalComputedStyle) {
      to = parseComputedColor(this.sprite.finalComputedStyle[this.propertyName]);
    } else {
      to = parseComputedColor(this.sprite.initialComputedStyle[this.propertyName]);
    }

    for (let channel of colorChannels) {
      this[`${channel}Tween`] = new Tween(
        // This is doing alpha premultiplication, which is what the
        // CSS spec does when interpolating colors
        from[channel] * from.a,
        to[channel] * to.a,
        this.duration,
        this.opts.easing || linear
      );
    }

    this.aTween = new Tween(
      from.a,
      to.a,
      this.duration,
      this.opts.easing || linear
    );


    while (channels.find(channel => !this[`${channel}Tween`].done)) {
      let currentValues = colorChannels.map(channel => {
        let value = this[`${channel}Tween`].currentValue;
        if (this.aTween.currentValue !== 0) {
          value = value / this.aTween.currentValue;
        }
        return Math.floor(value);
      });
      this.sprite.applyStyles({
        [this.propertyName]: `rgba(${currentValues.join(',')},${this.aTween.currentValue})`
      });
      yield rAF();
    }
  }
}

function parseComputedColor(c) {
  let m = /rgb\((\d+), (\d+), (\d+)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: 1
    };
  }
  m = /rgba\((\d+), (\d+), (\d+), (\d+(?:\.\d+)?)\)/.exec(c);
  if (m) {
    return {
      r: parseInt(m[1]),
      g: parseInt(m[2]),
      b: parseInt(m[3]),
      a: parseFloat(m[4])
    };
  }
}

function parseUserProvidedColor(c) {
  let testElement = document.createElement('div');
  testElement.style.display = 'none';
  testElement.style.color = c;
  document.body.appendChild(testElement);
  let result = parseComputedColor(getComputedStyle(testElement).color);
  testElement.remove();
  return result;
}
