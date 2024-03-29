import { rAF } from './concurrency-helpers.ts';
import { getOrCreate } from './singleton.ts';

const bridges = getOrCreate('motion-bridges', () => new WeakMap());

export function continueMotions(
  oldElement: Element,
  newElement: Element,
): void {
  bridges.set(newElement, oldElement);
  rAF().then(() => {
    if (bridges.get(newElement) === oldElement) {
      bridges.delete(newElement);
    }
  });
}

export function continuedFromElement(newElement: Element): Element | undefined {
  return bridges.get(newElement);
}
