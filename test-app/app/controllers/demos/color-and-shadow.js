import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import adjustColor from 'ember-animated/motions/adjust-color';
import boxShadow from 'ember-animated/motions/box-shadow';

const backgroundColor = adjustColor.property('background-color');

export default class extends Controller {
  *transition({ receivedSprites }) {
    receivedSprites.forEach(backgroundColor);
    receivedSprites.forEach(boxShadow);
  }

  @tracked showFirst = false;

  setShowFirst = (event) => {
    this.showFirst = event.target.checked;
  };
}
