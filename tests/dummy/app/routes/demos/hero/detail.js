//BEGIN-SNIPPET detail-2-snippet.js
import Route from '@ember/routing/route';

export default Route.extend({
  model({ id }) {
    return this.store.findRecord('person', id);
  },
});
//END-SNIPPET
