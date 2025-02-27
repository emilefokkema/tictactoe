import { createPointerEvents } from "./pointer-events/create-pointer-events";
import { PointerEventTargetLike } from "./pointer-events/types";
import { getInitialMeasurements, ScreenMeasurements } from "./measurements";
import { Renderer } from "./renderer/types";
import { Theme } from "./themes/themes";
import { GridImpl } from "./ui-impl/grid-impl";
import { TicTacToeMap } from "./map/tictactoemap";
import { ThemeSwitch } from "./themes/theme-switch";

export function renderMap(
    renderer: Renderer,
    pointerEvents: PointerEventTargetLike,
    screenMeasurements: ScreenMeasurements,
    map: TicTacToeMap<Theme>,
    themeSwitch: ThemeSwitch
): void {
    const eventTarget = createPointerEvents(pointerEvents);
    const {grid1: grid1Measurements, grid2: grid2Measurements} = getInitialMeasurements(screenMeasurements.width, screenMeasurements.height);
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
        themeSwitch.primaryTheme,
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
        themeSwitch.secondaryTheme,
        undefined
    )
    const primaryDrawing = map.renderOnGrid(grid1);
    const secondaryDrawing = map.renderOnGrid(grid2);
    const maxBottomRightX = Math.max(screenMeasurements.width, screenMeasurements.height)

    renderer.setRenderable({
        draw(ctx): void{
            ctx.save();
            ctx.clearRect(-Infinity, -Infinity, Infinity, Infinity);
            ctx.fillStyle = themeSwitch.primaryTheme.backgroundColor;
            ctx.fillRect(-Infinity, -Infinity, Infinity, Infinity);
            grid1.draw(ctx);
            ctx.beginPath();
            ctx.moveTo(maxBottomRightX, maxBottomRightX);
            ctx.lineToInfinityInDirection(1, -1);
            ctx.lineToInfinityInDirection(1, 1);
            ctx.lineToInfinityInDirection(-1, 1);
            ctx.clip();
            ctx.fillStyle = themeSwitch.secondaryTheme.backgroundColor;
            ctx.fillRect(-Infinity, -Infinity, Infinity, Infinity);
            grid2.draw(ctx)
            ctx.restore();
        }
    });

    themeSwitch.addEventListener('change', () => {
        primaryDrawing.setTheme(themeSwitch.primaryTheme);
        secondaryDrawing.setTheme(themeSwitch.secondaryTheme);
        renderer.rerender();
    })

    renderer.rerender();
}