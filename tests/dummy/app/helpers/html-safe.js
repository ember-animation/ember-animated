import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function docsEnabled(args) {
  return htmlSafe(args[0]);
}

export default helper(docsEnabled);
