import Component from '@glimmer/component';

export interface AnimatorComponent {
  registerSprite(element: Element, type: string): void;
}

export interface Animator {
  sprites: Component;
}
