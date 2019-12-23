//BEGIN-SNIPPET person-2-snippet.js
import Model, { attr } from '@ember-data/model';

export default Model.extend({
  name: attr(),
  avatarUrl: attr(),
});
//END-SNIPPET
