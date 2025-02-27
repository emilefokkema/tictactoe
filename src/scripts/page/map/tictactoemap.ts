import { Theme } from "../ui/theme"
import { Grid } from "../ui/grid"
import { RenderedMap } from "./rendered-map"

export interface TicTacToeMap<TTheme extends Theme> {
    renderOnGrid(
        grid: Grid<TTheme>
    ): RenderedMap<TTheme>
    load(): void
}