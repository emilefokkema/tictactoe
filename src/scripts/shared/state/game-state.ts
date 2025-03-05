import type { Player } from "../player"
import type { Winner } from "../winner"

export interface GameState {
    readonly id: number
    getNonequivalentSuccessors(): GameState[]
    getEquivalentWithSameLineage(predecessor: GameState): GameState | undefined
    getLastPlayedPosition(): number | undefined
    equals(other: GameState): boolean
    findWinner(): Winner | undefined
    getPlayersAtPositions(): Iterable<Player | 0>
    playPosition(position: number): GameState
    getCurrentPlayer(): Player
}