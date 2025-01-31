import { EventDispatcher } from "../events/event-dispatcher";
import { GameState } from "../state/game-state";
import { RevealedPosition } from "../state/revealed-position";
import { TicTacToeEventMap, TicTacToeStore } from "./tictactoe-store";

export class TicTacToeStoreImpl implements TicTacToeStore {
    private readonly eventDispatcher: EventDispatcher<TicTacToeEventMap> = new EventDispatcher({
        statehidden: [],
        positionrevealed: []
    });

    public hideState(state: GameState): void {
        this.eventDispatcher.dispatchEvent('statehidden', state);
    }
    public revealPosition(position: RevealedPosition): void {
        this.eventDispatcher.dispatchEvent('positionrevealed', position);
    }

    public addEventListener<TType extends keyof TicTacToeEventMap>(type: TType, listener: (ev: TicTacToeEventMap[TType]) => void): void {
        this.eventDispatcher.addEventListener(type, listener);
    }
    public removeEventListener<TType extends keyof TicTacToeEventMap>(type: TType, listener: (ev: TicTacToeEventMap[TType]) => void): void {
        this.eventDispatcher.removeEventListener(type, listener);
    }
}