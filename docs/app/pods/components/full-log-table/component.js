import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

function printSprites(context) {
  return {
    kept: context._keptSprites.map((s) => s.owner.value.message),
    sent: context._sentSprites.map((s) => s.owner.value.message),
    received: context._receivedSprites.map((s) => s.owner.value.message),
  };
}

export default class extends Component {
  @tracked messages = [];

  @action fullLog(context) {
    this.messages = [...this.messages, printSprites(context)];
  }
}
