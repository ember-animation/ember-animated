function partition(iterator, predicate) {
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

export { partition as default };
//# sourceMappingURL=partition.js.map
