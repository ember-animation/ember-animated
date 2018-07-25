# Sprites

## What is a sprite?

In ember-animated, a sprite is a piece of your application that you want to animate. The term "sprite" comes from a long tradition of two-dimensional graphics. More specifically, a sprite is an html element that carries additional data about itself, such as its starting point and its ending point. With this information, users can make changes to sprites in a variety of ways, and these changes will automatically get cleaned up at the end of an animation. 

The initial state of a sprite refers to the dimensions of the location where a sprite starts at. The final state of a sprite refers to the dimensions of the location that the sprite ends at. Every sprite is grouped into one of five categories based on what information the sprite holds: `insertedSprites`, `keptSprites`, `removedSprites`, `sentSprites`, and `receivedSprites`. The first three categories are outlined here: 


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



In this example, messages that are considered `removedSprites`, `insertedSprites`, or `keptSprites` after each animation. When a message is deleted from the inbox, it becomes a `removedSprite`. This makes sense because the message is deleted from the inbox where the inbox was the initial location of the message, and the message does not have a set final destination. 

When the inbox is refreshed, a new message is added. This added message is an `insertedSprite` that ends in the inbox, and does not have a set starting point. 

Finally, the remaining messages in the inbox that are not deleted or added are `keptSprites`. All of the `keptSprites` are untouched and do not change location, so the initial and the final location of these messages is the inbox.


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
