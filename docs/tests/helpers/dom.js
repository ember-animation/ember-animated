export function findByText(element, selector, text) {
  return [...element.querySelectorAll(selector)].find(
    (elt) => elt.textContent.trim() === text,
  );
}
