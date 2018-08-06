# Animating Between Components
Sprites can travel between two separate lists that know about each other. When a sprite starts in one list and ends in another, the two lists know that the sprite came from one and went to the other. This also applies in the opposite direction. So, sprites always have an initial and a final destination. Two lists identify when a sprite is animating between them by checking the states of that sprite. 

This is useful for animating elements that as they are repeatedly removed from one component and inserted to another. For example, imagine that you are hosting a dinner party and you need to keep track of the people that are going and not going. You would have a list of people that are going, and a list of the people that are not going. As people change their minds from going to not going, they would move back and forth between the two lists. `receivedSprites` and `sentSprites` help sprites animate smoothly between two lists or components. 

## receivedSprites: 
If a sprite holds the same data value on both sides, it is a `receivedSprite` on the list that it is going to.
## sentSprites: 
Sent sprites are the reverse of `receivedSprites`. If the sprite stores the same data value on both sides, it is a `sentSprite` on the list that it came from. 


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
In this demonstration, the "Delete with Undo" option shows what happens when an animation is interrupted. An email that would have been a `removedSprite` becomes a `keptSprite`. 

### Beacons
You may have noticed that this demonstration uses `#animated-beacon`. For more on beacons, see [animated-beacon](../docs/api/components/animated-beacon). 

In this example, emails animate between Refresh (mail icon), Trash, and the Inbox. When an email gets deleted, it is a `removedSprite`. If you refresh your inbox, the new email added is an `insertedSprite`. This scenario has two beacons, the refresh button and the trash button.

{{#docs-demo as |demo|}}
    {{#demo.example name="one"}}
      {{#full-log-table as |fullLog|}}
        {{logged-between-components fullLog=fullLog}}      
      {{/full-log-table}}
    {{/demo.example}}

    {{demo.snippet 'between-components-snippet.hbs' label='between-components.hbs'}}
    {{demo.snippet 'between-components-snippet.js' label='between-components.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}

### Animating Across Lists
In this example, the office is hosting a dinner party. Everyone received an email invitation with two options "going" and "not going".  The people invited can change their response as many times as they want. 

<ul> 
  <li>If Dwight said he was going then changes his mind, he will be removed from the "going" list and added to the "not going" list.</li>

  <li>This means that Dwight is a `sentSprite` on the going list and a `receivedSprite` on the "not going" list.</li>

  <li>If Dwight changes his mind again, he would be removed from the "not going" list and added to the "going" list.</li>

  <li>In this case, Dwight would be a `sentSprite` on the "not going" list and a `receivedSprite` on the "going list".</li>
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
Just like animattions can be applied to components, they can be applied to route transitions too! This is an example of animating sprites across different routes. When you select an icon from the list, the selected image and the list of images animate as the route changes. 

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
