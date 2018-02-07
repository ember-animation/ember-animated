import { helper } from '@ember/component/helper';

export function scale([value], {minValue, maxValue}) {
  value = Math.log2(value);
  minValue = Math.log2(minValue);
  maxValue = Math.log2(maxValue);
  return `${ 100 * (value - minValue) / (maxValue - minValue) }%`;

}
export default helper(scale);


