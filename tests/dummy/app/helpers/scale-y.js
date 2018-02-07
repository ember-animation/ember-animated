import { helper } from '@ember/component/helper';

export function scaleY([value], {minValue, maxValue}) {
  return `${100 - (100*(value - minValue)/(maxValue - minValue))}%`;

}

export default helper(scaleY);
