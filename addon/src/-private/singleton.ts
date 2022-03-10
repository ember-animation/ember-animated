declare global {
  // eslint-disable-next-line no-var
  var emberAnimatedSingleton: {
    [key: symbol]: unknown;
  };
}

window.emberAnimatedSingleton = window.emberAnimatedSingleton || {};

// As this is v2 addon, imported via webpack and extensively used in tests,
// this module may end up being used by app and tests chunks.
// In such scenario this module would be evaluated twice or more times hence we need
// a state that can be persisted via context outside the ES module.
// For some background info see https://github.com/webpack/webpack/issues/7556
export function getOrCreate<T>(key: string, construct: () => T): T {
  const symbol = Symbol.for(key);

  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------

  let globalSymbols = Object.getOwnPropertySymbols(
    window.emberAnimatedSingleton,
  );
  let hasFoo = globalSymbols.indexOf(symbol) > -1;

  if (!hasFoo) {
    window.emberAnimatedSingleton[symbol] = construct();
  }

  return window.emberAnimatedSingleton[symbol] as T;
}
