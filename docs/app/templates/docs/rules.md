# Rules for Data-Dependent Animations

`rules` can be defined when you want to use different animated transitions under different conditions. To do this, `rules` compare the new data value to the old data value (`oldList` and `newList`). If a component has `rules` and a `transition`, the `rules` will take precedence over the `transition`. 

In this demonstration, the `rules` choose a transition based on the number in the counter. When the counter increments, the new number is larger than the old number so the `toUp` transition runs. When the counter decrements, the old number is larger than the new one and and the `toDown` transition runs. 

> NOTE: When elements are animated, they are absolutely positioned, which implies `display: block`. If you are attempting to animate an inline element, there will be a slight visual "jump" when switching between inline and block displays.  Therefore, when using any of the animators &mdash; like `{{animated-value}}` used here &mdash; the animated children should not be `display: inline`.  In this demo, `count` is `display: inline-block`.

<DocsDemo as |demo|>
  <demo.example>
    <RulesExample />
  </demo.example>

  <demo.snippet @name="rules-snippet.hbs" @label="rules-example.hbs" />
  <demo.snippet @name="rules-snippet.js" @label="rules-example.js" />
  <demo.snippet @name="rules-snippet.css" />
</DocsDemo>
