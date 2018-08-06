# Sprites

## What is a sprite?

A sprite is an html element that holds additional data such as width, height, css styles, and bounds.

Sprites are useful for animating html elements as they are inserted, removed, or moved around to new positions. For example, imagine that a new email has just arrived. Where should it show up within a list of other emails? How should things move and shift when the user deletes an email, or maybe multiple emails at once? Sprites help manage these states and create a smooth flow between them.

The term "sprite" comes from a long tradition of two-dimensional graphics. However, in ember-animated, a sprite can do a lot more than a regular html element can. It holds data about its own position and state. Animations can be played forwards and backwards, in and out of the user's view. By using sprites, the developer does not need to track the state of different elements by hand.

Before we can write sprite animations, it's important to understand the lifecycle of a sprite as it enters, leaves, or moves around. There are five different categories that a sprite can belong to: `insertedSprites`, `keptSprites`, `removedSprites`, `sentSprites`, and `receivedSprites`. The difference between these categories is whether the sprite stores its initial and/or final bounds. For example, a newly inserted sprite stores the area of the page that it will end up at or its final bounds, and it animates to that location (`insertedSprite`). When a sprite is removed, it stores its current location or initial bounds, then animates from the place it started on the page (`removedSprite`). Finally, if a sprite is kept on the page, it holds both its initial and its final bounds, so it starts and ends in the same location (`keptSprite`). 

Let's begin with the first three categories:


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
    <th class="tg-7g6k">Initial Bounds</th>
    <th class="tg-47u2">Final Bounds</th>
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
</table>

***************



In this example, emails are `removedSprites`, `insertedSprites`, or `keptSprites` after each animation. When an email gets deleted from the inbox, it becomes a `removedSprite`. The inbox is the initial bounds of the deleted email. 

When the inbox gets refreshed by clicking the mail icon, a new email gets added to the inbox. This new email is an `insertedSprite` that ends up in the inbox, so the inbox serves as the final bounds of the added email.

Finally, the remaining emails in the inbox that are not deleted or added are `keptSprites`. The `keptSprites` only animate when other emails get added or deleted from the inbox. These emails are `keptSprites` because the inbox serves as both their initial and final bounds. 


{{#docs-demo as |demo|}}
    {{#demo.example name="inbox"}}
       {{#transition-log-table as |logTransition|}}
        {{logged-sprites logTransition=logTransition}}      
      {{/transition-log-table}}
    {{/demo.example}}

    {{demo.snippet 'sprites-snippet.hbs' label='sprites-example.hbs'}}
    {{demo.snippet 'sprites-snippet.js' label='sprites-example.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}




## For more on sentSprites and receivedSprites:
See [Animating Between Components](../docs/between).
