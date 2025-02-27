import { EventDispatcher } from "../events/event-dispatcher";
import { MapRendererEventMap, RemoteMapRenderer } from "../map/map-renderer";
import { ClonedGameState, GameState } from "../state/game-state";

interface StateHiddenMessage {
    type: 'statehidden',
    data: ClonedGameState
}

interface StateRevealedMessage {
    type: 'staterevealed',
    data: ClonedGameState
}

type BroadcastChannelMessage = StateHiddenMessage | StateRevealedMessage;

function isClonedGameState(value: unknown): value is ClonedGameState {
    return !!value && typeof (value as ClonedGameState).positions === 'number';
}
function isBroadcastChannelMessage(value: unknown): value is BroadcastChannelMessage{
    if(!value){
        return false;
    }
    const cast = value as BroadcastChannelMessage;
    return (cast.type === 'statehidden' || cast.type === 'staterevealed') && isClonedGameState(cast.data);
}

export function createBroadcastChannelRenderer(
    channel: BroadcastChannel
): RemoteMapRenderer {
    const eventDispatcher: EventDispatcher<MapRendererEventMap> = new EventDispatcher({
        statehidden: [],
        staterevealed: []
    })

    channel.addEventListener('message', (e) => {
        const data = e.data;
        if(!data || !isBroadcastChannelMessage(data)){
            return;
        }
        if(data.type === 'statehidden'){
            eventDispatcher.dispatchEvent('statehidden', GameState.reviveCloned(data.data));
            return;
        }
        if(data.type === 'staterevealed'){
            eventDispatcher.dispatchEvent('staterevealed', GameState.reviveCloned(data.data))
        }
    })

    return {
        addEventListener(type, listener){
            eventDispatcher.addEventListener(type, listener)
        },
        removeEventListener(type, listener){
            eventDispatcher.removeEventListener(type, listener)
        },
        hideState(state: GameState): void {
            channel.postMessage({
                type: 'statehidden',
                data: state
            })
        },
        revealState(state: GameState): void {
            channel.postMessage({
                type: 'staterevealed',
                data: state
            })
        }
    }
}