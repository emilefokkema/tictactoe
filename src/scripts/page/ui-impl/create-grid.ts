import type { Measurements } from "../measurements";
import type { CustomPointerEventTarget } from "../pointer-events/types";
import type { Theme } from "../themes/themes";
import { GridImpl } from "./grid-impl";
import type { RenderableGrid } from "./renderable-grid";
import type { Renderer } from "../renderer/types";

export function createGrid(
    measurements: Measurements,
    theme: Theme,
    eventTarget: CustomPointerEventTarget,
    renderer: Renderer
): RenderableGrid {
    return new GridImpl(
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
        theme,
        undefined
    )
}