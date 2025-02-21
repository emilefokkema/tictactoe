import { EventDispatcher } from "../events/event-dispatcher";
import { MapRenderer, MapRendererEventMap } from "../map/map-renderer";
import { GameState } from "../state/game-state";
import { GameStateTree } from "../state/game-state-tree";
import { Theme } from "../ui/theme";
import { Grid } from "../ui/grid";
import { TicTacToeImpl } from "./tictactoe-impl";
import { TicTacToeParent } from "./tictactoe-parent";

export function createTicTacToeRoot<TTheme extends Theme>(
    grid: Grid<TTheme>,
    theme: TTheme,
    tree: GameStateTree
): MapRenderer {
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
        theme
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
        }
    }
}