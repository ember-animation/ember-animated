# Sprites

## What is a sprite?

The term "sprite" comes from a long tradition of two-dimensional graphics. Historically, rendered images that could be moved independently of the scene needed extra memory to facilitate this animation. Those images were called sprites.

In Ember Animated, a **sprite** is an HTML element packaged with additional data, such as width, height, CSS styles, historical bounds, and more. This data enables developers to animate the HTML elements that comprise their application, and respond to state changes over time.

For example, imagine you're working on an email client and you'd like to add animations. Here's some scenarios you'll need to consider:

- When a new message arrives, where should it show up in the list of other messages, and how should the existing messages respond?
- How should the list behave when the user deletes a message?
- What happens if the user deletes multiple messages at once?

Sprites manage the different states of each of these messages, saving the developer from having to do complex and error-prone bookkeeping, and letting them focus on the actual logic of their application's animations.

## Categories of sprites

There are five categories of sprites, but we'll start with the first three:

1. `insertedSprites`
2. `removedSprites`
3. `keptSprites`

**`insertedSprites`** are sprites whose elements are entering or being _inserted into_ the DOM. They store the final bounds of their element, which can be used to animate the element from some starting point (such as off-screen) to that final location.

**`removedSprites`** are sprites whose elements are exiting or being _removed from_ the DOM. They store the initial bounds of their element, which can be used to animate the element from their last location to some final position.

Finally, **`keptSprites`** are sprites whose elements are in the DOM both before and after some state change. They store both their initial bounds and their final bounds, so that they can be animated between their beginning and ending positions.

---

To summarize, the three sprite categories can be differentiated by which data they store: their initial bounds, their final bounds, or both:

<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;margin-bottom:1rem;}
.tg td{font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg th{font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:black;}
.tg .tg-eh2d{background-color:#ffffff;border-color:inherit;vertical-align:top}
.tg .tg-47u2{font-weight:bold;background-color:#ffffff;border-color:inherit;vertical-align:top;text-align:left}
.tg .tg-7g6k{font-weight:bold;background-color:#ffffff;border-color:inherit;text-align:center;vertical-align:top}
</style>
<table class="tg">
  <tr>
    <th class="tg-47u2">Name</th>
    <th class="tg-7g6k">Initial Bounds</th>
    <th class="tg-47u2">Final Bounds</th>
  </tr>
  <tr>
    <td class="tg-eh2d">insertedSprites</td>
    <td class="tg-eh2d">❌</td>
    <td class="tg-eh2d">✅</td>
  </tr>
  <tr>
    <td class="tg-eh2d">keptSprites</td>
    <td class="tg-eh2d">✅</td>
    <td class="tg-eh2d">✅</td>
  </tr>
  <tr>
    <td class="tg-eh2d">removedSprites</td>
    <td class="tg-eh2d">✅</td>
    <td class="tg-eh2d">❌</td>
  </tr>
</table>

## Example: Email Inbox

This example shows all three categories of sprites.

Click the blue envelope to see a new email appear in the inbox. This new email is an `insertedSprite`. It animates from a starting location off-screen to its final location in the inbox. This final location is the "final bounds" we referred to earlier, and is a property of the sprite. (The initial location is a property of this particular transition. We'll cover transitions in the next section.)

If you select an email then click the trash can, you'll delete that message. This message is a `removedSprite`. It animates from its "initial bounds" (its initial location in the DOM when you clicked delete) to off-screen right. The "initial bounds" is a property of this removed sprite, and the off-screen location is a property of the transition.

Finally, whenever a message is added or deleted, the remaining emails in the inbox smoothly animate to their new position in the list. These messages are `keptSprites`, and each of these sprites have both an "initial bounds" and "final bounds" property. These properties are how these messages are able to smoothly adjust to accommodate the entering and exiting emails.


<DocsDemo as |demo|>
  <demo.example @name="inbox">
    <TransitionLogTable as |logTransition|>
      <LoggedSprites @logTransition={{logTransition}} />      
    </TransitionLogTable>
  </demo.example>

  <demo.snippet @name="sprites-snippet.hbs" @label="sprites-example.hbs" />
  <demo.snippet @name="sprites-snippet.js" @label="sprites-example.js" />
  <demo.snippet @name="sprites-snippet.css" />
</DocsDemo>



The last two categories of sprites, `sentSprites` and `receivedSprites`, are covered in {{docs-link 'Animating between components' 'docs.between'}}.

For now, read on to learn all about Transitions.
