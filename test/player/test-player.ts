import type { CustomPointerEventMap } from "@page/pointer-events/types";
import type { GameState } from "@shared/state/game-state";
import type { Grid } from "@page/ui/grid";
import type { MockTheme } from "../mock-theme";

export interface TestPlayerGrid extends Grid<MockTheme> {
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