# Animating Between Components
{{scroll-to-top}}
Sprites can travel back and forth between two separate lists as `receivedSprites` and `sentSprites`. Sprites animating between components always store their initial and final bounds. Two lists can identify when a sprite is animating between them by checking these bounds. If the initial bounds and the final bounds of a sprite are interchanging, then the sprite is animating between two lists (the initial bounds become the final bounds or the final bounds become the initial bounds).

This is useful for animating elements that are repeatedly inserted or removed from one component to another. For example, imagine that you are hosting a dinner party and you need to keep track of the people that are going and not going. You would have a list of people that are going, and a list of the people that can't go. As people change their minds from going to not going, they would move back and forth between the two lists. `receivedSprites` and `sentSprites` help sprites animate smoothly between two lists or components.

## receivedSprites:
When the final bounds of a sprite become its initial bounds, it is a `receivedSprite` on the list that it is going to.

## sentSprites:
Sent sprites are the reverse of `receivedSprites`. When the initial bounds of a sprite become its final bounds, it is a `sentSprite` on the list that it came from.


<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg .tg-eh2d{background-color:#ffffff;border-color:inherit;vertical-align:top}
.tg .tg-47u2{font-weight:bold;background-color:#ffffff;border-color:inherit;vertical-align:top;text-align:left}
.tg .tg-7g6k{font-weight:bold;background-color:#ffffff;border-color:inherit;text-align:center;vertical-align:top}
</style>
<table class="tg">
  <tr>
    <th class="tg-47u2">Name</th>
    <th class="tg-7g6k">Initial State</th>
    <th class="tg-47u2">Final State</th>
  </tr>
    <tr>
    <td class="tg-eh2d">Inserted</td>
    <td class="tg-eh2d">No</td>
    <td class="tg-eh2d">Yes</td>
  </tr>
  <tr>
    <td class="tg-eh2d">Kept</td>
    <td class="tg-eh2d">Yes</td>
    <td class="tg-eh2d">Yes</td>
  </tr>
  <tr>
    <td class="tg-eh2d">Removed</td>
    <td class="tg-eh2d">Yes</td>
    <td class="tg-eh2d">No</td>
  </tr>
  <tr>
    <td class="tg-eh2d">Received</td>
    <td class="tg-eh2d">Remote</td>
    <td class="tg-eh2d">Local</td>
  </tr>
  <tr>
    <td class="tg-eh2d">Sent</td>
    <td class="tg-eh2d">Local</td>
    <td class="tg-eh2d">Remote</td>
  </tr>
</table>



### Animating Across Lists
In this example, the office is hosting a dinner party. Everyone received an invitation with two options "going" and "can't go".  The people invited can change their response as many times as they want.

<ul>
  <li>If Dwight said he was going then changes his mind, he will be removed from the "going" list and added to the "can't go" list.</li>

  <li>This means that Dwight is a `sentSprite` on the going list and a `receivedSprite` on the "can't go" list.</li>

  <li>If Dwight changes his mind again, he would be removed from the "can't go" list and added to the "going" list.</li>

  <li>In this case, Dwight would be a `sentSprite` on the "can't go" list and a `receivedSprite` on the "going list".</li>
</ul>


{{#docs-demo as |demo|}}
    {{#demo.example name="two"}}
      {{#full-log-table as |fullLog|}}
        {{logged-two-lists fullLog=fullLog}}
      {{/full-log-table}}
    {{/demo.example}}

    {{demo.snippet 'between-two-lists-example-snippet.hbs' label='between-two-lists-example.hbs'}}
    {{demo.snippet 'between-two-lists-example-snippet.js' label='between-two-lists-example.js'}}
    {{demo.snippet 'two-lists-snippet.css'}}
{{/docs-demo}}


### Animating Across Routes
Just like animations can be applied to components, they can be applied to route transitions. This is an example of animating sprites across different routes. When you select an icon from the list, the selected image and the list of images animate as the route changes.

{{#docs-demo as |demo|}}
    {{#demo.example name="hero"}}
      <AnimatedContainer class="hero-example">
        {{hero-example}}
      </AnimatedContainer>
    {{/demo.example}}

    {{demo.snippet 'hero-snippet.hbs' label='hero.hbs'}}
    {{demo.snippet 'detail-snippet.hbs' label='detail.hbs'}}
    {{demo.snippet 'between-detail-snippet.js' label='detail.js'}}
    {{demo.snippet 'index-snippet.hbs' label='index.hbs'}}
    {{demo.snippet 'index-snippet.js' label='index.js'}}
    {{demo.snippet 'hero-snippet.css'}}
{{/docs-demo}}
