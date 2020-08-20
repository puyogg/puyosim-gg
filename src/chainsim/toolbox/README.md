# Toolbox

## Components
* `index.ts` - The overall toolbox container
  * `sim.ts` - Buttons for running simulations
  * `edit.ts` - Container for the different editing tools
    * `main.ts` - editing tools for the Puyo layer
    * `shadow.ts` - editing tools for the Shadow layer
    * `arrow.ts` - editing tools for the Arrow layer
    * `cursor.ts` - editing tools for the Cursor layer
    * `number.ts` - editing tools for the Cursor layer

## Helpers

* `tools.ts` - `ToolSprite`. PIXI Sprite extended class that also handles updating the `currentTool` state and moving the `toolCursor`
* `button.ts` - `Button`. PIXI Sprite extended class that automatically sets up the up/down appearance and events.
* `switch.ts` - `Switch`. PIXI Sprite extended class that's similar to a button, but it sticks to "down" when clicked.
* `page.ts` - `Page`. Extends `SimContainer` further to also set up the X, "Clear Layer" button, and tool cursor.