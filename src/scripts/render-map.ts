import { createPointerEvents } from "./pointer-events/create-pointer-events";
import { PointerEventTargetLike } from "./pointer-events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { palette } from "./palette";
import { Renderer } from "./renderer/types";
import { lightTheme } from "./themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { TicTacToeMap } from "./map/tictactoemap";

export function renderMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements,
    map: TicTacToeMap
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
    map.renderOnGrid(grid, lightTheme);
    //const ticTacToeRoot = createTicTacToeRoot(grid, lightTheme);

    //store.connectNewMapStore(ticTacToeRoot);

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