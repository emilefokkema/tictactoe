import { CustomPointerEventMap } from "../../src/scripts/pointer-events/types";
import { GameState } from "../../src/scripts/state/game-state";
import { Grid } from "../../src/scripts/ui/grid";

export interface TestPlayerGrid extends Grid {
    findByPosition(position: number[]): TestPlayerGridCell | undefined
}

export interface TestPlayerGridCell extends TestPlayerContext {
    click(): void;
    dblclick(): void;
    dispatch<TType extends keyof CustomPointerEventMap>(type: TType, event: CustomPointerEventMap[TType]): void
}

export interface TestPlayerContext {
    readonly grid: TestPlayerGrid
}

export interface TestPlayer {
    play(position: number): TestPlayer
    previous: TestPlayer | undefined
    grid: TestPlayerGrid
    gameState: GameState
}