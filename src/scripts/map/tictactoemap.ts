import { Theme } from "../ui/theme"
import { Grid } from "../ui/grid"

export interface TicTacToeMap<TTheme extends Theme> {
    renderOnGrid(
        grid: Grid<TTheme>,
        theme: Theme
    ): void
    load(): void
}