import type { Theme, Grid } from "../ui"
import type { RenderedMap } from "./rendered-map"

export interface TicTacToeMap<TTheme extends Theme> {
    renderOnGrid(
        grid: Grid<TTheme>
    ): RenderedMap<TTheme>
    load(): void
}