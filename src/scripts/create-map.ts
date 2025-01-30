import { createPointerEvents } from "./events/create-pointer-events";
import { PointerEventTargetLike } from "./events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { createTicTacToeRoot } from "./content/tictactoe-root";
import { palette } from "./palette";
import { Renderer } from "./renderer/types";
import { lightTheme } from "./themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { StorageState } from "./storage-state";

export function createMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements
): void {
    const eventTarget = createPointerEvents(pointerEvents);
    const measurements = getInitialMeasurements(screenMeasurements.width, screenMeasurements.height);
    const grid = new GridImpl(
        {
            ...measurements,
            background: {
                extendLeft: 0,
                extendRight: 0,
                extendTop: 0,
                extendBottom: 0
            }
        },
        eventTarget,
        lightTheme,
        undefined
    )
    const ticTacToeRoot = createTicTacToeRoot(
        grid,
        lightTheme
    )
    ticTacToeRoot.addEventListener('positionrevealed', () => renderer.rerender());
    ticTacToeRoot.addEventListener('statehidden', () => renderer.rerender())

    renderer.setRenderable({
        draw(ctx): void{
            ctx.fillStyle = palette.light;
            ctx.save();
            ctx.clearRect(-Infinity, -Infinity, Infinity, Infinity);
            ctx.fillRect(-Infinity, -Infinity, Infinity, Infinity);
            grid.draw(ctx);
            ctx.restore();
        }
    });

    const stateString = "{\"0\":{\"1\":{\"3\":{\"2\":{\"6\":{},\"w\":1},\"4\":{\"6\":{},\"w\":1},\"5\":{\"6\":{},\"w\":1},\"6\":{\"4\":{\"2\":{\"5\":{},\"w\":1},\"5\":{\"8\":{},\"w\":1},\"7\":{\"5\":{}},\"8\":{\"5\":{},\"w\":1}},\"w\":1},\"7\":{\"6\":{},\"w\":1},\"8\":{\"6\":{}}},\"w\":1}}}";
    const state = StorageState.fromJSON(JSON.parse(stateString));
    for(const revealed of state.getRevealedPositions()){
        ticTacToeRoot.revealPosition(revealed)
    }

    renderer.rerender();
}