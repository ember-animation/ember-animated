# Sprites

## What is a sprite?

A sprite is an html element that can animate by using its starting and ending positions. The term "sprite" comes from a long tradition of two-dimensional graphics. In ember-animated, sprites carry additional data about themselves. This extra information is typically the initial and/or the final location of the sprite. Sprites can animate from their starting position to their final position and vice versa. 

The initial state of a sprite is dimensions of the location where a sprite starts at. The dimensions of the location that the sprite ends at is the final state of that sprite. There are five sprite categories: `insertedSprites`, `keptSprites`, `removedSprites`, `sentSprites`, and `receivedSprites`. The first three categories are outlined here: 


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



In this example, emails are `removedSprites`, `insertedSprites`, or `keptSprites` after each animation. When an email gets deleted from the inbox, it becomes a `removedSprite`. In this scenario, the  the inbox was the initial state or location of the email. Notice that the deleted email did not have a set final location. 

When the inbox gets refreshed (click the mail icon), a new email gets added to the inbox. This new email is an `insertedSprite` that ends in the inbox, and does not have a set starting point. 

Finally, the remaining emails in the inbox that are not deleted or added are `keptSprites`. The `keptSprites` only animate when other emails get added or deleted from the inbox. These emails are `keptSprites` because their initial and final destination is the inbox.


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
