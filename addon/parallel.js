import { Promise } from './concurrency-helpers';

function isPromise(thing) {
  return thing && typeof thing.then === 'function';
}

function wake(entry, resolved, onError) {
 try {
    if (resolved.state === 'fulfilled') {
      entry.intermediate = entry.generator.next(resolved.value);
    } else {
      entry.intermediate = entry.generator.throw(resolved.reason);
    }
 } catch(err) {
   entry.intermediate = {
     done: true
   };
   if (onError) {
     onError(err);
   }
 }
}

function cancelGenerator(generator) {
  let e = new Error('TaskCancelation');
  e.message = 'TaskCancelation';
  try {
    generator.throw(e);
  } catch(err) {
    if (err.message !== 'TaskCancelation') {
      throw err;
    }
  }
}

function cancel(waiting) {
  if (!waiting) { return; }
  for (let i = 0; i < waiting.length; i++) {
    let entry = waiting[i];
    let value = entry.intermediate.value;
    if (isPromise(value) && value.__ec_cancel__) {
      value.__ec_cancel__();
    }
    cancelGenerator(entry.generator);
  }
}


function race(waiting) {
  let p = new Promise(resolve => {
    for (let index = 0; index < waiting.length; index++) {
      let entry = waiting[index];
      let value = entry.intermediate.value;
      Promise.resolve(value).then(value => {
        waiting = null;
        resolve({ state: 'fulfilled', value, index });
      }, reason => {
        waiting = null;
        resolve({ state: 'rejected', reason, index });
      });
    }
  });
  p.__ec_cancel__ = () => cancel(waiting);
  return p;
}

export default function * parallel(generators, onError) {
  let waiting = [];

  for (let i = 0; i < generators.length; i++) {
    let generator = generators[i];
    let entry = { generator };
    wake(entry, { state: 'fulfilled' }, onError);
    if (!entry.intermediate.done) {
      waiting.push(entry)
    }
  }

  while (waiting.length > 0) {
    let resolved = yield race(waiting);
    let { index } = resolved;
    let entry = waiting[index];
    waiting.splice(index, 1);

    // This condition is needed because we wait for both non-done
    // generators and done generators that returned a final promise.
    if (!entry.intermediate.done) {
      wake(entry, resolved, onError);
      if (!entry.intermediate.done || isPromise(entry.intermediate.value)) {
        // we keep waiting if the generator isn't done *or* if the
        // final return value was a promise.
        waiting.push(entry);
      }
    }
  }
}
