import type { Player } from "../player";
import type { Winner } from "../winner";
import type { GameState } from "./game-state";
import type { SerializedTree } from "./serialization";

export interface GameStateTree {
    state: GameState
    winnerInState: Winner | undefined
    winner: Player | undefined
    children: Map<number, GameStateTree>;
    addState(newState: GameState): GameStateTree
    addWinner(winnerState: GameState, winner: Player): GameStateTree
    findWinnerFor(state: GameState): GameStateTree
    removeState(stateToRemove: GameState): GameStateTree | undefined
    getForState(state: GameState): GameStateTree | undefined
    toJSON(): SerializedTree
    equals(other: GameStateTree | undefined): boolean
}