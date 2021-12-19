/* eslint-disable require-yield */
//BEGIN-SNIPPET between-two-lists-example-snippet.js
import { later } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { parallel } from 'ember-animated';

export default class extends Component {
  @tracked bounceBack = false;

  @tracked leftItems = this.makeLeftItems();
  @tracked rightItems = this.makeRightItems();

  *transition({ keptSprites, sentSprites, receivedSprites }) {
    keptSprites.forEach((sprite) => {
      parallel(move(sprite), scale(sprite));
    });

    sentSprites.forEach((sprite) => {
      parallel(move(sprite), scale(sprite));
    });

    receivedSprites.forEach((sprite) => {
      sprite.moveToFinalPosition();
    });
  }

  makeLeftItems() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem(i));
    }
    return result;
  }

  makeRightItems() {
    let result = [];
    for (let i = 0; i < 5; i++) {
      result.push(makeRandomItem2(i));
    }
    return result;
  }

  @action move(item, bounceCounter = 1) {
    let rightItems = this.rightItems;
    let leftItems = this.leftItems;
    let index = rightItems.indexOf(item);

    if (index !== -1) {
      this.rightItems = rightItems
        .slice(0, index)
        .concat(rightItems.slice(index + 1));
      this.leftItems = leftItems.concat([item]);
    } else {
      index = leftItems.indexOf(item);
      this.leftItems = leftItems
        .slice(0, index)
        .concat(leftItems.slice(index + 1));
      this.rightItems = rightItems.concat([item]);
    }
    if (this.bounceBack && bounceCounter > 0) {
      later(() => this.move(item, bounceCounter - 1), 1000);
    }
  }

  @action toggleBounceBack() {
    this.bounceBack = !this.bounceBack;
  }
}

function makeRandomItem(index) {
  let messages = ['Dwight', 'Stanley', 'Kelly', 'Ryan', 'Kevin'];
  let images = [
    'https://pbs.twimg.com/profile_images/549268771484229632/WnatiHzT_400x400.jpeg',
    'https://pbs.twimg.com/profile_images/1839546020/florida_stanley_400x400.jpg',
    'https://pbs.twimg.com/profile_images/71405458/2928282474_24807334d7_400x400.jpg',
    'https://pbs.twimg.com/profile_images/740436182107049984/y0N8Sqbi_400x400.jpg',
    'https://pbs.twimg.com/profile_images/118888142/Brian_Baumgartner_134198_400x400.jpg',
  ];
  return {
    id: Math.round(Math.random() * 1000),
    message: messages[index],
    image: images[index],
  };
}

function makeRandomItem2(index) {
  let messages = ['Oscar', 'Jim', 'Angela', 'Michael', 'Pam'];
  let images = [
    'https://pbs.twimg.com/profile_images/563110431653249025/5_Y6Amql_400x400.jpeg',
    'https://pbs.twimg.com/profile_images/3171824697/ef75d90df2e65ce326acf30262df5918_400x400.jpeg',
    'https://pbs.twimg.com/profile_images/800824511184572416/uC3hE1JB_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1323877428/the_office_nbc_tv_show_image_steve_carrol_as_michael_scott__1__400x400.jpg',
    'https://pbs.twimg.com/profile_images/1812302355/carEmmy_400x400.jpg',
  ];
  return {
    id: Math.round(Math.random() * 1000),
    message: messages[index],
    image: images[index],
  };
}
//END-SNIPPET
