// Polyfill Element.remove on IE11
// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md

// interface window {
//   Element: any;
//   CharacterData: any;
//   DocumentType: any;
// }

const classPrototypes = [window.Element, window.CharacterData, window.DocumentType].filter(klass => klass).map(klass => klass.prototype);
(function (arr) {
  arr.forEach(function (item) {
    if (Object.prototype.hasOwnProperty.call(item, 'remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      }
    });
  });
})(classPrototypes);
//# sourceMappingURL=element-remove-8rRE7jKB.js.map
