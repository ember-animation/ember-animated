function contagiousCancelation(promise) {
  promise._origThen = promise.then;
  promise.then = thenHelper;
}

function thenHelper(success, failure) {
  let derivedPromise = this._origThen(success, failure);
  derivedPromise.__ec_cancel__ = this.__ec_cancel__;
  contagiousCancelation(derivedPromise);
  return derivedPromise;
}

export function makeCancelable(promise, onCancelFn) {
  promise.__ec_cancel__ = function() {
    if (onCancelFn){
      onCancelFn();
    }
  }
  contagiousCancelation(promise);
  return promise;
}
