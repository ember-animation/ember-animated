import Controller from '@ember/controller';

export default class extends Controller {
  queryParams = ['animateSendingSide', 'distinguishSides'];
  distinguishSides = false;
  animateSendingSide = false;
}
