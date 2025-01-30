import { EventTargetLike } from "../events/types";
import { GameState } from "../state/game-state";
import { RevealedPosition } from "../state/revealed-position";
import { Theme } from "../themes";
import { Grid } from "../ui/grid";
import { TicTacToe } from "./tictactoe";
import { TicTacToeImpl, TicTacToeParent } from "./tictactoe-impl";

export interface TicTacToeEventMap {
    statehidden: GameState
    positionrevealed: RevealedPosition
}

export interface TicTacToeRoot extends TicTacToe, EventTargetLike<TicTacToeEventMap> {

}

export function createTicTacToeRoot(
    grid: Grid,
    theme: Theme
): TicTacToeRoot {
    const listeners: {[Key in keyof TicTacToeEventMap]: ((ev: TicTacToeEventMap[Key]) => void)[]} = {
        statehidden: [],
        positionrevealed: []
    };
    const parent: TicTacToeParent = {
        notifyRevealedPosition(position: RevealedPosition): void {
            console.log(`revealed ${JSON.stringify(position.gameState)}` + 
                (position.winner ? ` (winner ${position.winner.player} at ${JSON.stringify(position.winner.gameState)})` : ''))
            impl.revealPosition(position);
            for(const listener of listeners.positionrevealed.slice()){
                listener(position);
            }
        },
        notifyHiddenState(state: GameState): void {
            impl.hideState(state);
            for(const listener of listeners.statehidden.slice()){
                listener(state);
            }
        }
    };
    const impl = new TicTacToeImpl(
        parent,
        GameState.initial,
        undefined,
        theme,
        grid,
        undefined
    );
    return {
        hideState(state: GameState): void {
            impl.hideState(state);
        },
        revealPosition(position: RevealedPosition): void {
            impl.revealPosition(position);
        },
        addEventListener<TType extends keyof TicTacToeEventMap>(type: TType, listener: (ev: TicTacToeEventMap[TType]) => void): void {
            listeners[type].push(listener)
        },
        removeEventListener<TType extends keyof TicTacToeEventMap>(type: TType, listener: (ev: TicTacToeEventMap[TType]) => void): void {
            const listenersForEvent = listeners[type];
            const index = listenersForEvent.indexOf(listener);
            if(index === -1){
                return;
            }
            listenersForEvent.splice(index, 1);
        }
    };
}