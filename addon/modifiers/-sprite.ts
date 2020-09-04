import { modifier } from 'ember-modifier';
import { getPrivateAPI } from 'ember-animated/helpers/-make-animator';
import { Animator } from 'ember-animated/components/animator';

export default modifier(function sprite(
  element: Element,
  [type, animator]: [string, Animator] /* hash */,
) {
  getPrivateAPI(animator).registerSprite(element, type);
});
