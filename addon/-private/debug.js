import { DEBUG } from '@glimmer/env';

let printSprites;

if (DEBUG) {
  printSprites = function printSprites(context, label){
    let prefix = label ? label + ' ' : '';
    /* eslint no-console:0 */
    console.log(prefix + ['inserted', 'kept', 'removed', 'sent', 'received'].map(type => {
      return type + '=' + context[`_${type}Sprites`].map(s => s.owner.id).join(',')
    }).join(" | "));
  }
} else {
  printSprites = function(){};
}

export { printSprites };
