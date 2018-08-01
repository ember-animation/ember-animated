# Sprites

## What is a sprite?

A sprite is an html element that can be animated by using its starting and ending positions. The term "sprite" comes from a long tradition of two-dimensional graphics. In ember-animated, sprites carry additional data, such as the initial location and the final destination of that sprite. This way, sprites can animate from their given starting position, to their given final position. 

The initial state of a sprite is dimensions pf the location where a sprite starts at. The dimensions of the location that the sprite ends at is the final state of that sprite. Sprites are grouped into five categories based on which states the sprite holds: `insertedSprites`, `keptSprites`, `removedSprites`, `sentSprites`, and `receivedSprites`. The first three categories are outlined here: 


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
</table>

***************



In this example, emails are considered `removedSprites`, `insertedSprites`, or `keptSprites` after each animation. When an email is deleted from the inbox, it becomes a `removedSprite`. The email is deleted from the inbox where the inbox was the initial location of the message, and the email does not have a set final destination. 

When the inbox is refreshed, a new email is added. This new email is an `insertedSprite` that ends in the inbox, and does not have a set starting point. 

Finally, the remaining emails in the inbox that are not deleted or added are `keptSprites`. All of the `keptSprites` remain in the inbox, and only animate when other emails are added or deleted from the inbox. All of these emails are `keptSprites` because their initial and final destination is the inbox.


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
