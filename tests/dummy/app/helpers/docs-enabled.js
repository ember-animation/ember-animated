import { helper } from '@ember/component/helper';
import preval from 'babel-plugin-preval/macro';

export function docsEnabled() {
  return preval`module.exports = process.env.RAISE_ON_DEPRECATION !== 'true'`;
}

export default helper(docsEnabled);
