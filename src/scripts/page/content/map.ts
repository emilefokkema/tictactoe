import { createTicTacToeRoot } from "./tictactoe-root";
import type { GameStateTree } from "@shared/state/game-state-tree";
import { GameStateTreeImpl } from "@shared/state/game-state-tree-impl";
import type { LocalMapPersister } from "../store/local-map-persister";
import type { Theme, Grid } from "../ui";
import type { MapRenderer, TicTacToeMap, RenderedMap} from "../map";
import type { GameState } from "@shared/state/game-state";
import { createBroadcastChannelRenderer } from "../store/broadcast-channel-renderer";
import { createSharedWorkClient } from "../sharedworker/create-shared-work-client";
import type { RequestClient } from "../sharedworker/request-client";
import { createMapPersister } from "../store/map-persister";

export function createTicTacToeMap(
    localPersister: LocalMapPersister,
    broadcastChannel: BroadcastChannel,
    sharedWorkRequestClient: RequestClient
): TicTacToeMap {
    let tree: GameStateTree = GameStateTreeImpl.initial;
    const mapRenderers: MapRenderer[] = [];
    const remote = createBroadcastChannelRenderer(broadcastChannel);
    const sharedWorkClient = createSharedWorkClient(sharedWorkRequestClient);
    const mapPersister = createMapPersister(localPersister, sharedWorkClient);

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
        mapPersister.persist(tree.toJSON());
    }

    function revealState(state: GameState): void {
        tree = tree.addState(state);
    }

    function hideState(state: GameState): void {
        tree = tree.removeState(state)!;
    }

    async function load(): Promise<void> {
        const serialized = await mapPersister.read();
        if(serialized){
            tree = GameStateTreeImpl.fromJSON(serialized);
            notifyRenderers();
            mapPersister.persist(serialized)
        }else{
            persist();
        }
       
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
        grid: Grid<TTheme>
    ): RenderedMap<TTheme> {
        const root = createTicTacToeRoot(
            grid,
            tree
        );
        addRenderer(root);
        return root;
    }
}