# Animating Between Components
When animating between components, sprites travel back and forth from two separate locations or lists that know about each other. This means that when a sprite leaves one list and goes to another, the list that it goes to, or its endpoint, knows where the sprite started from. This also applies in the opposite direction. Therefore, sprites always have an initial and a final destination when animating between components. When two components know about each other, they can identify when a sprite is animating between them by checking the start or endpoint of that sprite.

## receivedSprites: 
When a sprite animates between lists it is a `removedSprite` on the list it started at, and an `insertedSprite` on the list ended at. If the sprite holds the same data value on both sides, it is considered a `receivedSprite` on the list that it is going to.
## sentSprites: 
Sent sprites are the reverse of `receivedSprites`. If the sprite stores the same data value on both sides while moving from one list to another, it will be considered a `sentSprite` on the list that it came from. 


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




### Interruption Cases
In this demonstration, the "Delete with Undo" option shows what happens when an animation is interrupted. Choose this option, then delete a message to see what happens when the delete action is stopped before the animation is complete. A message that would have been a `removedSprite` when deleted is now a `keptSprite`. 

### Beacons
You may have noticed that this demonstration uses `#animated-beacon`. For more on beacons, see [animated-beacon](../docs/api/components/animated-beacon). 

In this demonstration, sprites are represented by messages, and they animate between Refresh, Trash, and the Inbox. When a message is deleted, it is considered a `sentSprite` by the Inbox, and a `receivedSprite` by the trash. If you refresh your inbox, the message added is a `sentSprite` by refresh, and a `receivedSprite` by the inbox. 

{{#docs-demo as |demo|}}
    {{#demo.example name="one"}}
      {{#transition-log-table as |logTransition|}}
        {{logged-between-components logTransition=logTransition}}      
      {{/transition-log-table}}
    {{/demo.example}}

    {{demo.snippet 'between-components-snippet.hbs' label='between-components.hbs'}}
    {{demo.snippet 'between-components-snippet.js' label='between-components.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}

### Animating Across Lists
Here we have two lists of messages, the inbox and the trash. Now, when you delete a message, it is possible to recover that message from the trash and move it back into your inbox. So, a deleted message is actually a `receivedSprite` where the initial location is the inbox and the final destination is the trash. When moving a message from the trash to the inbox (restore), this message is a `sentSprite` from the trash.


{{#docs-demo as |demo|}}
    {{#demo.example name="two"}}
      {{between-two-lists-example}}
    {{/demo.example}}

    {{demo.snippet 'between-two-lists-example-snippet.hbs' label='between-two-lists-example.hbs'}}
    {{demo.snippet 'between-two-lists-example-snippet.js' label='between-two-lists-example.js'}}
    {{demo.snippet 'two-lists-snippet.css'}}
{{/docs-demo}}


### Animating Across Routes
This is an example of animating sprites across different routes. When you select an icon from the list, both the selected image and the list of image animates while the route changes.

{{#docs-demo as |demo|}}
    {{#demo.example name="hero"}}
      {{#animated-container class="debug"}}
        {{outlet}}
      {{/animated-container}}
    {{/demo.example}}

    {{demo.snippet 'hero-snippet.hbs' label='hero.hbs'}}
    {{demo.snippet 'detail-snippet.hbs' label='detail.hbs'}}
    {{demo.snippet 'detail-snippet.js' label='detail.js'}}
    {{demo.snippet 'index-snippet.hbs' label='index.hbs'}}
    {{demo.snippet 'index-snippet.js' label='index.js'}}
    {{demo.snippet 'hero-snippet.css'}}
{{/docs-demo}}
