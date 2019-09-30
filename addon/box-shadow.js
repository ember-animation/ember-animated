import { Color } from './color';

const innerPattern = /^ (\d+)px (\d+)px(?: (\d+)px)?(?: (\d+)px)?( inset)?(?:, )?/;

export class BoxShadow {
  static fromComputedStyle(string) {
    let originalString = string;
    let shadows = [];
    if (string === 'none') {
      return shadows;
    }
    while (string.length > 0) {
      let color = Color.fromComputedStyle(string);
      string = string.slice(color.sourceString.length);
      let m = innerPattern.exec(string);
      if (!m) {
        throw new Error(`failed to parse computed shadow ${originalString}`);
      }
      let x = parseInt(m[1]);
      let y = parseInt(m[2]);
      let blur = m[3] == null ? 0 : parseInt(m[3]);
      let spread = m[4] == null ? 0 : parseInt(m[4]);
      let inset = m[5] != null;
      shadows.push(new BoxShadow({ color, x, y, blur, spread, inset }));
      string = string.slice(m[0].length);
    }
    return shadows;
  }

  constructor({ color, x, y, blur, spread, inset }) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.blur = blur;
    this.spread = spread;
    this.inset = inset;
  }
}
