// Easily allow apps, which are not yet using strict mode templates, to consume your Glint types, by importing this file.
// Add all your components, helpers and modifiers to the template registry here, so apps don't have to do this.
// See https://typed-ember.gitbook.io/glint/environments/ember/authoring-addons

import type { element as ElementHelper } from 'ember-element-helper';
import type AnimatedBeacon from './components/animated-beacon.ts';
import type AnimatedContainer from './components/animated-container.ts';
import type AnimatedEach from './components/animated-each.ts';
import type AnimatedIf from './components/animated-if.ts';
import type AnimatedOrphans from './components/animated-orphans.ts';
import type AnimatedValue from './components/animated-value.ts';
import type EaListElement from './components/ea-list-element.ts';
import { EmbroiderMacrosRegistry } from '@embroider/macros';
import { EmbroiderUtilRegistry } from '@embroider/util';

export default interface Registry
  extends EmbroiderMacrosRegistry,
    EmbroiderUtilRegistry {
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
