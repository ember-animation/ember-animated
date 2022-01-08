import { helper } from '@ember/component/helper';
import podNames from 'ember-component-css/pod-names';

export default helper(function styleNamespace([componentName]) {
  return podNames[componentName];
});
