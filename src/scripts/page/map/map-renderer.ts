import type { EventTargetLike } from "../events/types"
import type { GameState } from "@shared/state/game-state"
import type { GameStateTree } from "@shared/state/game-state-tree"

export interface MapRendererEventMap {
    statehidden: GameState
    staterevealed: GameState
}

export interface MapRendererEventTarget extends EventTargetLike<MapRendererEventMap> {

}

export interface RemoteMapRenderer extends MapRendererEventTarget {
    hideState(state: GameState): void
    revealState(state: GameState): void
}

export interface MapRenderer extends MapRendererEventTarget {
    setTree(tree: GameStateTree): void
}