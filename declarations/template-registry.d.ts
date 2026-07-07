import type { element as ElementHelper } from 'ember-element-helper';
import type AnimatedBeacon from './components/animated-beacon';
import type AnimatedContainer from './components/animated-container';
import type AnimatedEach from './components/animated-each';
import type AnimatedIf from './components/animated-if';
import type AnimatedOrphans from './components/animated-orphans';
import type AnimatedValue from './components/animated-value';
import type EaListElement from './components/ea-list-element.ts';
export default interface Registry {
    AnimatedBeacon: typeof AnimatedBeacon;
    'animated-beacon': typeof AnimatedBeacon;
    AnimatedContainer: typeof AnimatedContainer;
    'animated-container': typeof AnimatedContainer;
    AnimatedEach: typeof AnimatedEach;
    'animated-each': typeof AnimatedEach;
    AnimatedIf: typeof AnimatedIf;
    'animated-if': typeof AnimatedIf;
    AnimatedOrphans: typeof AnimatedOrphans;
    'animated-orphans': typeof AnimatedOrphans;
    AnimatedValue: typeof AnimatedValue;
    'animated-value': typeof AnimatedValue;
    EaListElement: typeof EaListElement;
    element: typeof ElementHelper;
    '-element': typeof ElementHelper;
}
//# sourceMappingURL=template-registry.d.ts.map