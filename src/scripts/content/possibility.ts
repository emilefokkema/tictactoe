import { CustomPointerEventMap } from "../pointer-events/types";
import { GameState } from "../state/game-state";
import { GridCell } from "../ui/grid";

export interface PossibilityParent {
    play(
        possibility: Possibility
    ): void
}

export class Possibility {
    private readonly pointerDownEventListener: (ev: CustomPointerEventMap['pointerdown']) => void;
    private readonly clickEventListener: (ev: CustomPointerEventMap['click']) => void;
    public constructor(
        public readonly cell: GridCell,
        parent: PossibilityParent,
        public readonly gameState: GameState
    ){
        this.pointerDownEventListener = (ev) => {
            ev.allowCancelClick()
        };
        cell.addEventListener('pointerdown', this.pointerDownEventListener);
        this.clickEventListener = () => parent.play(this)
        cell.addEventListener('click', this.clickEventListener);
    }

    public destroy(): void {
        this.cell.removeEventListener('pointerdown', this.pointerDownEventListener);
        this.cell.removeEventListener('click', this.clickEventListener);
    }
}