import { rAF } from './concurrency-helpers.js';
import { getOrCreate } from './singleton.js';

const bridges = getOrCreate('motion-bridges', () => new WeakMap());
function continueMotions(oldElement, newElement) {
  bridges.set(newElement, oldElement);
  rAF().then(() => {
    if (bridges.get(newElement) === oldElement) {
      bridges.delete(newElement);
    }
  });
}
function continuedFromElement(newElement) {
  return bridges.get(newElement);
}

export { continueMotions, continuedFromElement };
//# sourceMappingURL=motion-bridge.js.map
