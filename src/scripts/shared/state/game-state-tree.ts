import { Player } from "../player";
import { GameState } from "./game-state";
import { SerializedTree } from "./serialization";

export interface GameStateTree {
    state: GameState
    winner: Player | undefined
    children: Map<number, GameStateTree>;
    addState(newState: GameState): GameStateTree
    addWinner(winnerState: GameState, winner: Player): GameStateTree
    removeState(stateToRemove: GameState): GameStateTree | undefined
    getForState(state: GameState): GameStateTree | undefined
    getWinnersInState(state: GameState): Iterable<{winner: Player, state: GameState}>
    toJSON(): SerializedTree
    equals(other: GameStateTree | undefined): boolean
}