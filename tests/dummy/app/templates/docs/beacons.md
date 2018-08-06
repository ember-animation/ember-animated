
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
