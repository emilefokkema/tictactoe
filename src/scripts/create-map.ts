import { createPointerEvents } from "./events/create-pointer-events";
import { PointerEventTargetLike } from "./events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { createTicTacToeRoot } from "./content/tictactoe-root";
import { palette } from "./palette";
import { Renderer } from "./renderer/types";
import { lightTheme } from "./themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { StorageState } from "./storage-state";

declare global {
    interface Window {
        record: unknown[]
    }
}
export function createMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements
): void {
    const record: unknown[] = [];
    window.record = record;
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
    ticTacToeRoot.addEventListener('positionrevealed', (p) => {
        record.push({revealed: JSON.parse(JSON.stringify(p))});
        renderer.rerender()
    });
    ticTacToeRoot.addEventListener('statehidden', (s) => {
        record.push({hidden: JSON.parse(JSON.stringify(s))})
        renderer.rerender()
    })

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

    const stateString = "{\"0\":{\"1\":{\"w\":1}}}";
    const state = StorageState.fromJSON(JSON.parse(stateString));
    for(const revealed of state.getRevealedPositions()){
        ticTacToeRoot.revealPosition(revealed)
    }

    renderer.rerender();
}