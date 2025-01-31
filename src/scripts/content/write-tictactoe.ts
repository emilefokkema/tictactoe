import { GameState } from "../state/game-state";
import { RevealedPosition } from "../state/revealed-position";

export interface WriteTicTacToe {
    hideState(state: GameState): void
    revealPosition(position: RevealedPosition): void
}