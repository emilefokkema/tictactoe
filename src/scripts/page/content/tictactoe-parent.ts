import { GameState } from "../state/game-state"

export interface TicTacToeParent {
    notifyRevealedState(state: GameState): void
    notifyHiddenState(state: GameState): void
}