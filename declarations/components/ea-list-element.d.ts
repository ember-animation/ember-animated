import Component from '@ember/component';
import type Child from '../-private/child.ts';
interface EaListElementSignature<T = unknown> {
    Args: {
        Named: {
            child: T;
            elementToChild: WeakMap<Element, Child>;
        };
    };
    Blocks: {
        default: [T, number];
    };
}
export default class EaListElement extends Component<EaListElementSignature> {
    tagName: string;
    isEmberAnimatedListElement: boolean;
    child: Child;
    elementToChild: Map<Element, Child>;
    didRender(): void;
    _forEachElement(fn: (elt: Element) => void): void;
}
export {};
//# sourceMappingURL=ea-list-element.d.ts.map