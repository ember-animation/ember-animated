import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['animateSendingSide', 'distinguishSides'],
  distinguishSides: false,
  animateSendingSide: false
});
