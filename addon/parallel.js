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

function race(waiting) {
  let cancels = []
  let p = new Promise(resolve => {
    for (let index = 0; index < waiting.length; index++) {
      let entry = waiting[index];
      let value = entry.intermediate.value;
      if (isPromise(value) && value.__ec_cancel__) {
        cancels.push(value.__ec_cancel__);
      }
      Promise.resolve(value).then(value => {
        resolve({ state: 'fulfilled', value, index });
      }, reason => {
        resolve({ state: 'rejected', reason, index });
      });
    }
  });
  p.__ec_cancel__ = () => {
    for (let i = 0; i < cancels.length; i++) {
      cancels[i]();
    }
  };
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

    if (entry.intermediate.done) {
      // the generator had already finished, but had returned a
      // promise to us, which has now resolved.
      waiting.splice(index, 1);
    } else {
      wake(entry, resolved, onError);
      if (entry.intermediate.done && !isPromise(entry.intermediate.value)) {
        // generator finished and returned a non-promise, so we can
        // clear it out immediately.
        waiting.splice(index, 1);
      }
    }
  }

}
