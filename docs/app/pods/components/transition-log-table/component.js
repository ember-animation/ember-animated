import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

function printSprites(context) {
  return {
    inserted: context.insertedSprites.map((s) => s.owner.value.message),
    kept: context.keptSprites.map((s) => s.owner.value.message),
    removed: context.removedSprites.map((s) => s.owner.value.message),
  };
}

export default class extends Component {
  @tracked messages = [];

  @action logTransition(context) {
    this.messages = [...this.messages, printSprites(context)];
  }
}
