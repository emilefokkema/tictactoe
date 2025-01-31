import { CustomPointerEventMap } from "../pointer-events/types";
import { EventTargetLike } from '../events/types'
import { Winner } from "../winner";
import { Themeable } from "./themeable";

export interface GridCell extends EventTargetLike<CustomPointerEventMap> {
    displayX(): void
    displayO(): void
    displayGrid(): Grid
    clear(): void
}

export interface Grid extends Themeable {
   cells: readonly [GridCell, GridCell, GridCell, GridCell, GridCell, GridCell, GridCell, GridCell, GridCell]
   displayWinner(winner: Winner | undefined): void
}