//BEGIN-SNIPPET person-2-snippet.js
import DS from 'ember-data';
const { attr } = DS;

export default DS.Model.extend({
  name: attr(),
  avatarUrl: attr(),
});
//END-SNIPPET
