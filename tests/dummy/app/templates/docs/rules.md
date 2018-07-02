# Rules

The rules argument chooses which transition to run when the list changes depending on the data values within the list. `rules` takes precedence over `use` where `use` simply specifies which animation to run when a list changes. In this example, the rule compares the values of the first elements in two lists, and determines whether to animate to the left or to the right based on those values. 

  ```js
  import Component from '@ember/component';
  import { toLeft, toRight } from 'ember-animated/transitions/move-over';

  export default Component.extend({
    rules({ oldItems, newItems }) {
      if (oldItems[0] < newItems[0]) {
        return toLeft;
      } else {
        return toRight;
      }
    },
  });
  ```

