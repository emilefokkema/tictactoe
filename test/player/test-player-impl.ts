import { GameState } from "../../src/scripts/page/state/game-state";
import { MockGrid } from "./mock-grid";
import { TestPlayer, TestPlayerContext } from "./test-player";

class TestPlayerImpl implements TestPlayer {
    public get grid(){return this.context.grid;}
    public constructor(
        private readonly context: TestPlayerContext,
        public readonly previous: TestPlayer | undefined,
        public readonly gameState: GameState
    ){}

    public play(position: number): TestPlayer {
        const newCell = this.context.grid.findByPosition([position]);
        newCell.click();
        const newGameState = this.gameState.playPosition(position);
        return new TestPlayerImpl(newCell, this, newGameState);
    }
}

export function createTestPlayer(): TestPlayer {
    return new TestPlayerImpl(new MockGrid(), undefined, GameState.initial);
}