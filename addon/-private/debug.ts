import { DEBUG } from '@glimmer/env';
import TransitionContext from './transition-context';
import Sprite from './sprite';

let printSprites;

if (DEBUG) {
  printSprites = function printSprites(
    context: TransitionContext,
    label?: string,
  ) {
    let isOrphan: boolean | null = null;
    let prefix = label ? label + ' ' : '';
    /* eslint no-console:0 */
    let spriteSummary = ['inserted', 'kept', 'removed', 'sent', 'received']
      .map(type => {
        return (
          type +
          '=' +
          ((context as any)[`_${type}Sprites`] as Sprite[])
            .map(s => {
              if (isOrphan == null) {
                // the first time we encounter a sprite, we use it to get a
                // handle on whether this whole transition is happening
                // inside animated-orphans or not. In the case of an orphan,
                // we may have no parentElement (because our original home
                // was destroyed already) or we may have the
                // animated-orphans component as our parent (because we were
                // already an orphan and got interrupted so we're starting a
                // new motion)
                isOrphan =
                  !s.element.parentElement ||
                  s.element.parentElement.classList.contains(
                    'animated-orphans',
                  );
              }
              return s.owner!.id;
            })
            .join(',')
        );
      })
      .join(' | ');
    console.log(prefix + spriteSummary + (isOrphan ? ' | (orphan)' : ''));
  };
} else {
  printSprites = function() {};
}

export { printSprites };
