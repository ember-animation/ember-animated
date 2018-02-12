import { helper } from '@ember/component/helper';

export function scale([value], {minValue, maxValue, measure}) {
  if( measure === 'x' ) {  // circle x position
    value = Math.log2(value);
    minValue = Math.log2(minValue);
    maxValue = Math.log2(maxValue);
    return `${ 100 * (value - minValue) / (maxValue - minValue) }%`;
  }
  else if( measure === 'y' ) {  // circle y position
    return `${100 - (100 * (value - minValue)/(maxValue - minValue))}%`;
  }
  else if( measure === 'r' ) {  // circle radius
    let perc = (100 * (value - minValue)/(maxValue - minValue))
    return `${ perc * 0.087 + 0.3 }%`; // circle radii are at least 0.3%
  }                                    // but no more than 9% of chart x-axis

}
export default helper(scale);


