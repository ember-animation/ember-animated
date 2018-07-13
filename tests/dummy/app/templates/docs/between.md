# Animating Between Components
-----Description------

## receivedSprites: 
When moving a sprite from one list to another, a sprite is considered a removed sprite on the list it is leaving from, and an inserted sprite on the list it is going to. If the sprite holds the same data value on both sides, it is considered a received sprite on the list that it is going to. This means that instead of being an inserted sprite and storing only its final state, this received sprite will store both its initial state and its final state.
## sentSprites: 
Sent sprites are the reverse of received sprites. If the sprite stores the same data value on both sides while moving from one list to another, it will be considered a sent sprite on the list that it came from instead of a removed sprite. This means that it will store both its initial state and its final state instead of storing just its initial state.

----Interruption Cases----



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

{{#docs-demo as |demo|}}
    {{#demo.example}}
      {{between-components}}
    {{/demo.example}}

    {{demo.snippet 'between-components-snippet.hbs'}}
    {{demo.snippet 'between-components-snippet.js'}}
    {{demo.snippet 'sprites-snippet.css'}}
{{/docs-demo}}