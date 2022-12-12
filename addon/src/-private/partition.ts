export default function partition<T>(
  iterator: Iterable<T>,
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const truthy = [];
  const falsy = [];
  for (const item of iterator) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}
