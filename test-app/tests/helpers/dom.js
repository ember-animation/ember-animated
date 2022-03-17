import { findAll } from '@ember/test-helpers';

export function findByText(selector, text) {
  return [...findAll(selector)].find((elt) => elt.textContent.trim() === text);
}
