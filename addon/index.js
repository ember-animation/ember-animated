export {
  rAF,
  microwait,
  wait,
  afterRender,
  clock,
  allSettled,
  Promise
} from './-private/concurrency-helpers';

export { printSprites } from './-private/debug';

export {
  default as Motion,
  continueMotions
} from './-private/motion';
