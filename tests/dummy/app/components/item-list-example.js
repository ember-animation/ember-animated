import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from 'dummy/utils/tracking';
import { task } from 'ember-animated/-private/ember-scheduler';
import { current } from 'ember-animated/-private/scheduler';

export default class ItemListsExample extends Component {
  @service('-ea-motion') motionService;

  duration = 1000;

  @tracked items = makeRandomList();

  @task(function* () {
    this.motionService.willAnimate({
      task: current,
      duration: this.duration,
      component: this,
    });

    this.items = this.items
      .concat([makeRandomItem()])
      .sort(numeric)
      .map((elt) => ({ id: elt.id }));
  })
  addItemTask;

  @task(function* (which) {
    this.motionService.willAnimate({
      task: current,
      duration: this.duration,
      component: this,
    });

    this.items = this.items.items.filter((i) => i !== which);
  })
  removeItemTask;
}

function numeric(a, b) {
  return a.id - b.id;
}

function makeRandomItem() {
  return { id: Math.round(Math.random() * 1000) };
}

function makeRandomList() {
  let result = [];
  for (let i = 0; i < 10; i++) {
    result.push(makeRandomItem());
  }
  return result.sort(numeric);
}
