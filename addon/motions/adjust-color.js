import { Motion, rAF, Tween } from 'ember-animated';
import linear from 'ember-animated/easings/linear';

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
    let from = parseComputedColor(this.sprite.initialComputedStyle[this.propertyName]);
    let to = parseComputedColor(this.sprite.finalComputedStyle[this.propertyName]);

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
