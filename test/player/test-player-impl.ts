import type { GameState } from "@shared/state/game-state";
import { GameStateImpl } from "../../src/scripts/shared/state/game-state-impl";
import { MockGrid } from "./mock-grid";
import type { TestPlayer, TestPlayerContext } from "./test-player";

class TestPlayerImpl implements TestPlayer {
    public get grid(){return this.context.grid;}
    public constructor(
        private readonly context: TestPlayerContext,
        public readonly previous: TestPlayer | undefined,
        public readonly gameState: GameState
    ){}

    public play(position: number): TestPlayer {
        const newCell = this.context.grid.findByPosition([position]);
        if(!newCell){
            return this;
        }
        newCell.click();
        const newGameState = this.gameState.playPosition(position);
        return new TestPlayerImpl(newCell, this, newGameState);
    }
}

export function createTestPlayer(): TestPlayer {
    return new TestPlayerImpl(new MockGrid(), undefined, GameStateImpl.initial);
}