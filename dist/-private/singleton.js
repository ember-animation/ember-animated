window.emberAnimatedSingleton = window.emberAnimatedSingleton || {};

// As this is v2 addon, imported via webpack and extensively used in tests,
// this module may end up being used by app and tests entry points.
// In such scenario, module(s) would be evaluated twice hence we need
// a state that can be persisted via context across ES module invocations.
// For some background info see https://github.com/webpack/webpack/issues/7556
//
// We should remove this file and getOrCreate usage once ember-auto-import gets fixed,
// so we would have single entry point for app and tests.
// Link to track status: https://github.com/ef4/ember-auto-import/issues/503
function getOrCreate(key, construct) {
  const symbol = Symbol.for(key);

  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------

  let globalSymbols = Object.getOwnPropertySymbols(window.emberAnimatedSingleton);
  let hasFoo = globalSymbols.indexOf(symbol) > -1;
  if (!hasFoo) {
    window.emberAnimatedSingleton[symbol] = construct();
  }
  return window.emberAnimatedSingleton[symbol];
}

export { getOrCreate };
//# sourceMappingURL=singleton.js.map
