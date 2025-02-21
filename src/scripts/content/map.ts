import { createTicTacToeRoot } from "./tictactoe-root";
import { GameStateTree } from "../state/game-state-tree";
import { GameStateTreeImpl } from "../state/game-state-tree-impl";
import { deserializeTree } from "../state/serialization";
import { MapPersister } from "../store/map-persister";
import { Theme } from "../ui/theme";
import { Grid } from "../ui/grid";
import { MapRenderer } from "../map/map-renderer";
import { TicTacToeMap } from "../map/tictactoemap";
import { GameState } from "../state/game-state";
import { createBroadcastChannelRenderer } from "../store/broadcast-channel-renderer";

export function createTicTacToeMap<TTheme extends Theme>(
    localPersister: MapPersister,
    broadcastChannel: BroadcastChannel
): TicTacToeMap<TTheme> {
    let tree: GameStateTree = GameStateTreeImpl.initial;
    const mapRenderers: MapRenderer[] = [];
    const remote = createBroadcastChannelRenderer(broadcastChannel);
    remote.addEventListener('staterevealed', (s) => {
        revealState(s);
        notifyRenderers();
    })
    remote.addEventListener('statehidden', (s) => {
        hideState(s);
        notifyRenderers();
    })

    return { load, renderOnGrid }

    function notifyRenderers(): void {
        for(const mapRenderer of mapRenderers){
            mapRenderer.setTree(tree);
        }
    }

    function persist(): void {
        localPersister.persist(tree.toJSON());
    }

    function revealState(state: GameState): void {
        tree = tree.addState(state);
    }

    function hideState(state: GameState): void {
        tree = tree.removeState(state)!;
    }

    function load(): void {
        const serialized = localPersister.read();
        if(!serialized){
            return;
        }
        tree = deserializeTree(GameStateTreeImpl.initial, serialized);
        notifyRenderers();
    }
    function addRenderer(renderer: MapRenderer): void {
        renderer.addEventListener('staterevealed', (s) => {
            revealState(s);
            persist();
            notifyRenderers();
            remote.revealState(s);
        });
        renderer.addEventListener('statehidden', (s) => {
            hideState(s);
            persist();
            notifyRenderers();
            remote.hideState(s);
        });
        mapRenderers.push(renderer);
    }

    function renderOnGrid<TTheme extends Theme>(
        grid: Grid<TTheme>,
        theme: Theme
    ): void {
        addRenderer(createTicTacToeRoot(
            grid,
            theme,
            tree
        ))
    }
}