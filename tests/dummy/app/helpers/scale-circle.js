import { helper } from '@ember/component/helper';

export function scaleCircle([value], {minValue, maxValue}) {
  return `${(100 * (value - minValue)/(maxValue - minValue))}%`;
}

export default helper(scaleCircle);
