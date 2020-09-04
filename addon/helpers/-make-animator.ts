import { helper } from '@ember/component/helper';
import Component from '@glimmer/component';
import {
  AnimatorComponent,
  Animator,
} from 'ember-animated/components/animator';

const privateAPI: WeakMap<Animator, AnimatorComponent> = new WeakMap();

export function makeAnimator(
  _params: any[],
  hash: { sprites: Component; animatorComponent: AnimatorComponent },
): Animator {
  let animator = {
    sprites: hash.sprites,
  };
  privateAPI.set(animator, hash.animatorComponent);
  return animator;
}

export function getPrivateAPI(animator: Animator): AnimatorComponent {
  let result = privateAPI.get(animator);
  if (!result) {
    throw new Error(
      `bug: received something that doesn't seem to be a valid Animator`,
    );
  }
  return result;
}

export default helper(makeAnimator);
