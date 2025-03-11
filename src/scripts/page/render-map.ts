import { getInitialMeasurements, type Measurements, type ScreenMeasurements } from "./measurements";
import type { Renderer } from "./renderer/types";
import type { Theme, ThemeSwitch } from "./themes";
import type { TicTacToeMap } from "./map";
import type { RenderableGrid } from "./ui-impl/renderable-grid";

export function renderMap(
    renderer: Renderer,
    screenMeasurements: ScreenMeasurements,
    map: TicTacToeMap,
    themeSwitch: ThemeSwitch,
    gridFactory: (measurements: Measurements, theme: Theme) => RenderableGrid
): void {
    const {grid1: grid1Measurements, grid2: grid2Measurements} = getInitialMeasurements(screenMeasurements.width, screenMeasurements.height);
    const grid1 = gridFactory(grid1Measurements, themeSwitch.primaryTheme);
    const grid2 = gridFactory(grid2Measurements, themeSwitch.secondaryTheme);

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