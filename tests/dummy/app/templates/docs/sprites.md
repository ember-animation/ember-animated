# Sprites

## What is a sprite?

The sprite abstraction in this library allows users to compose new transitions out of motions. Our sprites carry their own data or dimensions, so that users can manipulate sprites in a variety of ways, and these changes will automatically get cleaned up at the end of an animation. There are five different types of sprites, and the distinction between the five types is the data that each sprite stores. 

Data that sprites can store refers to the different states a sprite can have. The initial state of a sprite refers to the dimensions of the location that the sprite starts at or comes from. Likewise, the final state of a sprite refers to the dimensions of the location that the sprite ends at or is going to. 

## keptSprites: 
Kept sprites store both their final state and their initial state. 
## insertedSprites: 
Inserted sprites store their final state but not their initial state. They are new sprites that will be inserted to a list, so you need to give them an initial state in order to move them. 
## removedSprites: 
Removed sprites are the reverse of inserted sprites. They store their initial state but they do not store their final state. To move removed sprites, you must give them a final state.
## receivedSprites: 
When moving a sprite from one list to another, a sprite is considered a removed sprite on the list it is leaving from, and an inserted sprite on the list it is going to. If the sprite holds the same data value on both sides, it is considered a received sprite on the list that it is going to. This means that instead of being an inserted sprite and storing only its final state, this received sprite will store both its initial state and its final state.
## sentSprites: 
Sent sprites are the reverse of received sprites. If the sprite stores the same data value on both sides while moving from one list to another, it will be considered a sent sprite on the list that it came from instead of a removed sprite. This means that it will store both its initial state and its final state instead of storing just its initial state.