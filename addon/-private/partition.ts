export default function partition<T>(
  iterator: Iterable<T>,
  predicate: (item: T) => boolean,
): [T[], T[]] {
  let truthy = [];
  let falsy = [];
  for (let item of iterator) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}
