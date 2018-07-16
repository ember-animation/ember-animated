# Sprites

## What is a sprite?

In ember-animated a sprite represents a piece of your application that you want to animate. The term "sprite" comes from a long tradition of two-dimensional graphics. A sprite is an html element that carries additional data. Our sprites carry their own data which consists of the different states a sprite can be. With this data, users can manipulate sprites in a variety of ways, and these changes will automatically get cleaned up at the end of an animation. 

The initial state of a sprite refers to the dimensions of the location where a sprite starts at. Likewise, the final state of a sprite refers to the dimensions of the location that the sprite ends at. Every sprite is grouped into one of five categories in any given animation:


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



In this example, messages that are considered `removedSprites`, `insertedSprites`, or `keptSprites` after each animation. When a message is deleted from the inbox, it becomes a `removedSprite`. This makes sense because they are removed from the inbox where the inbox was the initial location of the message, and there is no final destination. When the inbox is refreshed and new messages come in, the messages that come from the refresh are `insertedSprites`. This makes sense because a message from refresh go to the inbox, where the inbox is the final destination. Finally, the remaining messages in the inbox that are not deleted or added from refresh are `keptSprites`. All of the `keptSprites` remain in the inbox throughout deletions and additions to the inbox, so both their initial and final locations are the inbox. 


{{#docs-demo as |demo|}}
    {{#demo.example name="inbox"}}
      {{sprites-example}}
    {{/demo.example}}

    {{demo.snippet 'sprites-snippet.hbs'}}
    {{demo.snippet 'sprites-snippet.js' label='component.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}




## For more on sentSprites and receivedSprites:
See [Animating Between Components](../docs/between).