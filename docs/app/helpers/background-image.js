import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export function backgroundImage([url]) {
  // htmlSafe is justified here because encodeURI guarantees that whatever input
  // we were given, it can't escape the url.
  return htmlSafe(`background-image: url('${encodeURI(url)}')`);
}

export default helper(backgroundImage);
