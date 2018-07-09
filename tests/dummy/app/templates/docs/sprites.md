# Sprites

## What is a sprite?

In ember-animated a sprite represents a piece of your application that you want to animate. A sprite is an html element that carries additioal data. Our sprites carry their own data or dimensions, so that users can manipulate sprites in a variety of ways, and these changes will automatically get cleaned up at the end of an animation. -- history -- 

Data that sprites can store refers to the different states a sprite can have. The initial state of a sprite refers to the dimensions of the location that the sprite starts at or comes from. Likewise, the final state of a sprite refers to the dimensions of the location that the sprite ends at or is going to. Every sprite is grouped into one of five categories in any given animation:

## keptSprites: 
Kept sprites store both their final state and their initial state. 
## insertedSprites: 
Inserted sprites store their final state but not their initial state. They are new sprites that will be inserted to a list, so you need to give them an initial state in order to move them. 
## removedSprites: 
Removed sprites are the reverse of inserted sprites. They store their initial state but they do not store their final state. To move removed sprites, you must give them a final state.


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


{{#docs-demo as |demo|}}
    {{#demo.example name="inbox"}}
      {{sprites-example}}
    {{/demo.example}}

    {{demo.snippet 'sprites-snippet.hbs'}}
    {{demo.snippet 'sprites-snippet.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}




## For more on sentSprites and receivedSprites:
See [Animating Between Components](../docs/between). 