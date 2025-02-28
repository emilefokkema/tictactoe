import type { CustomPointerEventMap } from "../pointer-events/types";
import type { EventTargetLike } from '../events/types'
import type { Winner } from "@shared/winner";
import type { Themeable } from "./themeable";

export interface Slot extends EventTargetLike<CustomPointerEventMap> {
    clear(): void
}
export interface MarkSlot extends Slot {
    displayX(): void
    displayO(): void
}
export interface GridSlot<TTheme> extends Slot {
    displayGrid(): Grid<TTheme>
}
export interface GridCell<TTheme> extends MarkSlot, GridSlot<TTheme> {}

export interface Grid<TTheme> extends Themeable<TTheme> {
    theme: TTheme
    cells: readonly [
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>,
        GridCell<TTheme>
    ]
    displayWinner(winner: Winner | undefined): void
}