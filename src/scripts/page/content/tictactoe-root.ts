import { EventDispatcher } from "../events/event-dispatcher";
import type { MapRenderer, MapRendererEventMap, RenderedMap } from "../map";
import type { GameState } from "@shared/state/game-state";
import type { GameStateTree } from "@shared/state/game-state-tree";
import type { Theme, Grid } from "../ui";
import { TicTacToeImpl } from "./tictactoe-impl";
import type { TicTacToeParent } from "./tictactoe-parent";

export interface TicTacToeRoot<TTheme> extends MapRenderer, RenderedMap<TTheme> {

}

export function createTicTacToeRoot<TTheme extends Theme>(
    grid: Grid<TTheme>,
    tree: GameStateTree
): TicTacToeRoot<TTheme> {
    const eventDispatcher: EventDispatcher<MapRendererEventMap> = new EventDispatcher({
        statehidden: [],
        staterevealed: []
    });
    const parent: TicTacToeParent = {
        notifyRevealedState(state: GameState): void {
            eventDispatcher.dispatchEvent('staterevealed', state);
        },
        notifyHiddenState(state: GameState): void {
            eventDispatcher.dispatchEvent('statehidden', state);
        }
    };
    const impl = new TicTacToeImpl(
        parent,
        tree,
        grid,
        undefined,
        grid.theme
    );
    return {
        addEventListener<TType extends keyof MapRendererEventMap>(type: TType, listener: (ev: MapRendererEventMap[TType]) => void): void {
            eventDispatcher.addEventListener(type, listener);
        },
        removeEventListener<TType extends keyof MapRendererEventMap>(type: TType, listener: (ev: MapRendererEventMap[TType]) => void): void {
            eventDispatcher.removeEventListener(type, listener);
        },
        setTree(tree: GameStateTree): void{
            impl.setTree(tree)
        },
        setTheme(theme: TTheme): void {
            impl.setTheme(theme);
        }
    }
}