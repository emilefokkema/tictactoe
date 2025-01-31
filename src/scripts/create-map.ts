import { createPointerEvents } from "./pointer-events/create-pointer-events";
import { PointerEventTargetLike } from "./pointer-events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { createTicTacToeRoot } from "./content/tictactoe-root";
import { palette } from "./palette";
import { Renderer } from "./renderer/types";
import { lightTheme } from "./themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { TicTacToeStore } from "./store/tictactoe-store";
import { connectStores } from "./store/connect-stores";

export function createMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements,
    store: TicTacToeStore
): void {
    const eventTarget = createPointerEvents(pointerEvents);
    const measurements = getInitialMeasurements(screenMeasurements.width, screenMeasurements.height);
    const grid = new GridImpl(
        renderer,
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
    const ticTacToeRoot = createTicTacToeRoot(grid, lightTheme);
    connectStores(store, ticTacToeRoot);

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

    renderer.rerender();
}