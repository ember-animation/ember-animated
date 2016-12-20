// takes an element, the element's computed style, and either 'Top' or
// 'Bottom'.
//
// yields [Element, ComputedStyle] for increasingly deep descendants
// of the given element whose top (or bottom) margin collapses with
// the given element's.
export function *collapsedChildren(element, cs, which) {
  // margin collapse only happens if we have no border or padding
  if (cs[`border${which}Width`] === '0px' && cs[`padding${which}`] === '0px') {
    let block;
    if (which === 'Top') {
      block = firstChildBlock(element);
    } else {
      block = lastChildBlock(element);
    }
    if (block) {
      let [ child, childCS ] = block;
      yield block;
      yield * collapsedChildren(child, childCS, which);
    }
  }
}

function firstChildBlock(element) {
  for (let i = 0; i < element.children.length; i++) {
    let child = element.children[i];
    let childCS = getComputedStyle(child);
    if (childCS.clear !== 'none') {
      // an intervening block with clearance prevents margin collapse
      return;
    }
    if (isChildBlock(childCS)) {
      return [child, childCS];
    }
  }
}

function lastChildBlock(element) {
  for (let i = element.children.length - 1; i >= 0; i--) {
    let child = element.children[i];
    let childCS = getComputedStyle(child);
    if (childCS.clear !== 'none') {
      // an intervening block with clearance prevents margin collapse
      return;
    }
    if (isChildBlock(childCS)) {
      return [child, childCS];
    }
  }
}


function isChildBlock(cs) {
  return cs.display === 'block' && (
    cs.position === 'static' || cs.position === 'relative'
  ) && cs.float === 'none' && cs.overflow === 'visible';
}

export function collapsedMargin(element, cs, which) {
  let margin = parseFloat(cs[`margin${which}`]);
  for (let [, childCS] of collapsedChildren(element, cs, which)) {
    let childMargin = parseFloat(childCS[`margin${which}`]);
    if (childMargin > margin) {
      margin = childMargin;
    }
  }
  return margin;
}
