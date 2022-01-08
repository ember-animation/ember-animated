import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { task, timeout } from 'ember-concurrency';

export default class IndexToggleBar extends Component {
  @tracked progress = 0;

  constructor(...args) {
    super(...args);

    this.startProgressTask.perform();
  }

  @task
  *startProgressTask() {
    let totalMilliseconds = 5000;
    let millisecondsPerPercent = totalMilliseconds / 100;

    while (this.progress < 100) {
      yield timeout(millisecondsPerPercent / 2);
      this.progress = this.progress + 0.5;
    }

    this.onDismiss();
  }

  @action onDismiss() {
    this.args.onDismiss?.();
  }

  get progressWidthStyle() {
    return htmlSafe(`width: ${this.progress}%`);
  }

  @action cancelProgress() {
    this.startProgressTask.cancelAll();
  }

  @action resumeProgress() {
    this.startProgressTask.perform();
  }
}
