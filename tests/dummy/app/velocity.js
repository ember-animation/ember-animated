import { default as originalVelocity } from 'velocity';

/*
  Adds cancellation to velocity promises.

  This has a limitation: velocity doesn't let us cancel an individual
  animation, we can only cancel all animations on the same element.
*/
export default function velocity(elt, params, opts) {
  let promise = originalVelocity(elt, params, opts);
  if (promise) {
    promise.__ec_cancel__ = () => {
      velocity(elt, 'stop');
    };
  }
  return promise;
}
Object.assign(velocity, originalVelocity);
