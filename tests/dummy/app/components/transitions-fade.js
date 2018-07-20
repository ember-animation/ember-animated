//BEGIN-SNIPPET transitions-fade-snippet.js
import Component from '@ember/component';
import fade from 'ember-animated/transitions/fade';

export default Component.extend({
  fade,
  fadeMessage: false,
  mail: "Hello",
});
//END-SNIPPET