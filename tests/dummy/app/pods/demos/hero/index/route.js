//BEGIN-SNIPPET index-2-snippet.js
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.findAll('person');
  }
});
//END-SNIPPET