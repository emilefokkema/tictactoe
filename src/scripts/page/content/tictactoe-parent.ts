import type { GameState } from "@shared/state/game-state"

export interface TicTacToeParent {
    notifyRevealedState(state: GameState): void
    notifyHiddenState(state: GameState): void
}