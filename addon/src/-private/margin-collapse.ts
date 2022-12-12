// takes an element, the element's computed style, and either 'top' or
// 'bottom'.
//
// returns list of Element for increasingly deep descendants
// of the given element whose top (or bottom) margin collapses with
// the given element's.
export function collapsedChildren(
  element: Element,
  cs: CSSStyleDeclaration,
  which: 'top' | 'bottom',
  children: Element[] = [],
) {
  // margin collapse only happens if we have no border or padding
  if (
    isBlock(cs) &&
    cs.getPropertyValue(`border-${which}-width`) === '0px' &&
    cs.getPropertyValue(`padding-${which}`) === '0px'
  ) {
    let block;
    if (which === 'top') {
      block = firstChildBlock(element);
    } else {
      block = lastChildBlock(element);
    }
    if (block) {
      const [child, childCS] = block;
      children.push(child);
      collapsedChildren(child, childCS, which, children);
    }
  }
  return children;
}

function firstChildBlock(
  element: Element,
): [Element, CSSStyleDeclaration] | undefined {
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    const childCS = getComputedStyle(child as Element);
    if (childCS.clear !== 'none') {
      // an intervening block with clearance prevents margin collapse
      return;
    }
    if (isBlock(childCS)) {
      return [child as Element, childCS];
    }
  }
  return;
}

function lastChildBlock(
  element: Element,
): [Element, CSSStyleDeclaration] | undefined {
  for (let i = element.children.length - 1; i >= 0; i--) {
    const child = element.children[i];
    const childCS = getComputedStyle(child as Element);
    if (childCS.clear !== 'none') {
      // an intervening block with clearance prevents margin collapse
      return;
    }
    if (isBlock(childCS)) {
      return [child as Element, childCS];
    }
  }
  return;
}

function isBlock(cs: CSSStyleDeclaration) {
  return (
    cs.display === 'block' &&
    (cs.position === 'static' || cs.position === 'relative') &&
    cs.getPropertyValue('float') === 'none' &&
    cs.overflow === 'visible'
  );
}
