import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class extends Controller {
  @tracked viewBig = false;

  @action
  toggleView() {
    this.viewBig = !this.viewBig;
  }
}
