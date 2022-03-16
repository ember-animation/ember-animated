import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';

export default class extends Controller {
  @tracked tableMode = false;

  fade = fade;

  @action toggle() {
    this.tableMode = !this.tableMode;
  }
}
