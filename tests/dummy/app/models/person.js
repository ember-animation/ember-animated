//BEGIN-SNIPPET person-2-snippet.js
import Model, { attr } from '@ember-data/model';

export default class Person extends Model {
  @attr() name;
  @attr() avatarUrl;
}
//END-SNIPPET
