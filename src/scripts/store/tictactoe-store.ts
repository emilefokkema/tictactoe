import { EventTargetLike } from "../events/types"
import { GameState } from "../state/game-state"
import { RevealedPosition } from "../state/revealed-position"

export interface TicTacToeEventMap {
    statehidden: GameState
    positionrevealed: RevealedPosition
}

export interface TicTacToeStoreMutations {
    hideState(state: GameState): void
    revealPosition(position: RevealedPosition): void
}

export interface TicTacToeStore extends TicTacToeStoreMutations, EventTargetLike<TicTacToeEventMap> {
    
}