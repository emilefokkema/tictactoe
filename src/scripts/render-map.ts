import { createPointerEvents } from "./pointer-events/create-pointer-events";
import { PointerEventTargetLike } from "./pointer-events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { Renderer } from "./renderer/types";
import { lightTheme, darkTheme, Theme } from "./themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { TicTacToeMap } from "./map/tictactoemap";

export function renderMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements,
    map: TicTacToeMap<Theme>
): void {
    const eventTarget = createPointerEvents(pointerEvents);
    const {grid1: grid1Measurements, grid2: grid2Measurements} = getInitialMeasurements(screenMeasurements.width, screenMeasurements.height);
    const theme1 = darkTheme;
    const theme2 = theme1 === darkTheme ? lightTheme : darkTheme;
    console.log('grid 2 measurements:', grid2Measurements)
    const grid1 = new GridImpl(
        renderer,
        {
            ...grid1Measurements,
            background: {
                extendLeft: 0,
                extendRight: 0,
                extendTop: 0,
                extendBottom: 0
            }
        },
        eventTarget,
        theme1,
        undefined
    )
    const grid2 = new GridImpl(
        renderer,
        {
            ...grid2Measurements,
            background: {
                extendLeft: 0,
                extendRight: 0,
                extendTop: 0,
                extendBottom: 0
            }
        },
        eventTarget,
        theme2,
        undefined
    )
    map.renderOnGrid(grid1, theme1);
    map.renderOnGrid(grid2, theme2);
    const maxBottomRightX = Math.max(screenMeasurements.width, screenMeasurements.height)

    renderer.setRenderable({
        draw(ctx): void{
            ctx.save();
            ctx.fillStyle = theme1.backgroundColor;
            ctx.clearRect(-Infinity, -Infinity, Infinity, Infinity);
            ctx.fillRect(-Infinity, -Infinity, Infinity, Infinity);
            grid1.draw(ctx);
            ctx.beginPath();
            ctx.moveTo(maxBottomRightX, maxBottomRightX);
            ctx.lineToInfinityInDirection(1, -1);
            ctx.lineToInfinityInDirection(1, 1);
            ctx.lineToInfinityInDirection(-1, 1);
            ctx.clip();
            ctx.fillStyle = theme2.backgroundColor;
            ctx.fillRect(-Infinity, -Infinity, Infinity, Infinity);
            grid2.draw(ctx)
            ctx.restore();
        }
    });

    renderer.rerender();
}