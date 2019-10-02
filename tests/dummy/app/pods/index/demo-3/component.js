import Component from '@ember/component';
import { computed } from '@ember/object';
import move from 'ember-animated/motions/move';
import scale from 'ember-animated/motions/scale';
import { wait } from 'ember-animated';
import dedent from '../utils/dedent';
import { inject as service } from '@ember/service';

export default Component.extend({
  rootUrl: service(),

  * collapse({ receivedSprites, sentSprites }) {
    for (let sprite of sentSprites) {
      sprite.moveToFinalPosition();
    }

    for (let sprite of receivedSprites) {
      move(sprite);
      scale(sprite);
    }
  },

  * shuffle({ receivedSprites, sentSprites }) {
    for (let sprite of sentSprites) {
      sprite.moveToFinalPosition();
    }

    for (let sprite of receivedSprites) {
      sprite.applyStyles({
        zIndex: (receivedSprites.length - receivedSprites.indexOf(sprite)) * 100
      });
      move(sprite);
      scale(sprite);
    }
  },

  * shuffleWithStagger({ receivedSprites, sentSprites }) {
    for (let sprite of sentSprites) {
      sprite.moveToFinalPosition();
    }

    for (let sprite of receivedSprites) {
      sprite.applyStyles({
        zIndex: (receivedSprites.length - receivedSprites.indexOf(sprite)) * 100
      });
      move(sprite);
      scale(sprite);

      yield wait(75);
    }
  },

  selectedCategoryName: 'Nature',

  categories: computed(function() {
    return [
      {
        name: 'Nature',
        images: [
          'images/nature-1.jpeg',
          'images/nature-2.jpeg',
          'images/nature-3.jpeg'
        ],
      },
      {
        name: 'Architecture',
        images: [
          'images/architecture-1.jpeg',
          'images/architecture-2.jpeg',
          'images/architecture-3.jpeg'
        ]
      },
      {
        name: 'Food',
        images: [
          'images/food-1.jpeg',
          'images/food-2.jpeg',
          'images/food-3.jpeg'
        ]
      },
    ].map(category => {
      category.images = category.images.map(img => this.rootUrl.build(img));
      return category;
    });
  }),

  selectedCategory: computed('selectedCategoryName', function() {
    return this.categories.find(category => category.name === this.selectedCategoryName);
  }),

  componentDiff: dedent`
      import Component from '@ember/component';
    + import { wait } from 'ember-animated';

      export default Component.extend({

        * transition({ receivedSprites, sentSprites }) {
          for (let sprite of receivedSprites) {
            move(sprite);
            scale(sprite);
          }

          for (let sprite of sentSprites) {
            move(sprite);
            scale(sprite);
    +
    +       yield wait(75);
          }
        }

      });
  `

});
