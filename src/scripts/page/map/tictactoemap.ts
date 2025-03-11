import type { Theme, Grid } from "../ui"
import type { RenderedMap } from "./rendered-map"

export interface TicTacToeMap {
    renderOnGrid<TTheme extends Theme>(
        grid: Grid<TTheme>
    ): RenderedMap<TTheme>
    load(): Promise<void>
}