import { helper } from '@ember/component/helper';

export function scaleCircle([value], {minValue, maxValue}) {
  maxValue = parseInt(maxValue, 10);
  value = Math.log10(value);
  minValue = Math.log10(minValue);
  maxValue = Math.log10(maxValue);
  let num = value - minValue;
  let den = maxValue - minValue;
  let fract = num/den;
  let perc = 100 * fract;
  return `${(perc)}%`;
}

export default helper(scaleCircle);
