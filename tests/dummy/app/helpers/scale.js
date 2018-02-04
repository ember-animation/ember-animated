import { helper } from '@ember/component/helper';

export function scale([value], {minValue, maxValue}) {
  return `${100*(value - minValue)/(maxValue - minValue)}%`;



}

export default helper(scale);
