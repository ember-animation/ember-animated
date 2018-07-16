# Animating Between Components
When animating between components, sprites travel from one component to another. Therefore, sprites always have an initial and a final destination when animating between components or lists. 

## receivedSprites: 
When moving a sprite from one list to another, a sprite is considered a removed sprite on the list it is leaving from, and an inserted sprite on the list it is going to. If the sprite holds the same data value on both sides, it is considered a received sprite on the list that it is going to. This means that instead of being an inserted sprite and storing only its final state, this received sprite will store both its initial state and its final state.
## sentSprites: 
Sent sprites are the reverse of received sprites. If the sprite stores the same data value on both sides while moving from one list to another, it will be considered a sent sprite on the list that it came from instead of a removed sprite. This means that it will store both its initial state and its final state instead of storing just its initial state.


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




### Interruption Cases
In this demonstration, the "Delete with Undo" option shows what happens when an animation is interrupted. Choose this option, then delete a message to see what happens when the delete action is stopped before the animation is complete. A message that would have been a `removedSprite` when deleted is now a `keptSprite`. 

### Beacons
You may have noticed that this demonstration uses `#animated-beacon`. For more on beacons, see [animated-beacon](../docs/api/components/animated-beacon). 


In this demonstration, sprites are represented by messages, and they animatine between Refresh, Trash, and the Inbox. If a message starts in the inbox and is deleted, it goes to the trash. Therefore, it is considered a `sentSprite` by the Inbox, and a `receivedSprite` by the Trash. If you refresh your inbox, a message comes from refresh and goes to the inbox. In this case, the message is considered a `sentSprite` by refresh, and a `receivedSprite` by the inbox. 

{{#docs-demo as |demo|}}
    {{#demo.example name="one"}}
      {{between-components}}
    {{/demo.example}}

    {{demo.snippet 'between-components-snippet.hbs'}}
    {{demo.snippet 'between-components-snippet.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}

### Animating Across Lists
Here we have two lists of messages, the inbox and the trash. Now, when you delete a message, it is possible to recover that message from the trash and move it back into your inbox. So, a deleted message is actually a `receivedSprite` to the trash where the initial location is the inbox and the final destination is the trash. When moving a message from the trash to the inbox (restore), this message is a `sentSprite` from the trash.


{{#docs-demo as |demo|}}
    {{#demo.example name="two"}}
      {{two-lists-example}}
    {{/demo.example}}

    {{demo.snippet 'two-lists-example-snippet.hbs'}}
    {{demo.snippet 'two-lists-example-snippet.js'}}
    {{demo.snippet 'two-lists-snippet.css'}}
{{/docs-demo}}

{{#docs-demo as |demo|}}
    {{#demo.example name="three"}}
      {{swapping-lists-example}}
    {{/demo.example}}

    {{demo.snippet 'swapping-lists-snippet.hbs'}}
    {{demo.snippet 'swapping-lists-snippet.js'}}
    {{demo.snippet 'swapping-lists-snippet.css'}}
{{/docs-demo}}

### Animating Across Routes

{{#docs-demo as |demo|}}
    {{#demo.example name="four"}}
      {{index}}
    {{/demo.example}}

    {{demo.snippet 'index-snippet.hbs'}}
    {{demo.snippet 'index-snippet.js'}}
{{/docs-demo}}