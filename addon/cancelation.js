function contagiousCancelation(promise) {
  promise._origThen = promise.then;
  promise.then = thenHelper;
}

function thenHelper(success, failure) {
  let derivedPromise = this._origThen(
    cancelationUpdater(this, success),
    cancelationUpdater(this, failure)
  );
  derivedPromise.__ec_cancel__ = () => this.__ec_cancel__();
  contagiousCancelation(derivedPromise);
  return derivedPromise;
}

function cancelationUpdater(promise, callback) {
  return function(result) {
    if (promise.__ec_is_canceled__) {
      return;
    }
    let response = callback(result);
    if (response && response.__ec_cancel__) {
      promise.__ec_cancel__ = response.__ec_cancel__;
    }
    return response;
  }
}

export function makeCancelable(promise, onCancelFn) {
  promise.__ec_cancel__ = function() {
    promise.__ec_is_canceled__ = true;
    if (onCancelFn){
      onCancelFn();
    }
  }
  contagiousCancelation(promise);
  return promise;
}
