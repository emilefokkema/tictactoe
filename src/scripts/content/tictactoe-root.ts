import { GameState } from "../state/game-state";
import { RevealedPosition } from "../state/revealed-position";
import { Theme } from "../themes";
import { Grid } from "../ui/grid";
import { TicTacToeImpl, TicTacToeParent } from "./tictactoe-impl";
import { EventDispatcher } from "../events/event-dispatcher";
import { TicTacToeEventMap, TicTacToeStore } from "../store/tictactoe-store";

export interface TicTacToeRoot extends TicTacToeStore {

}

export function createTicTacToeRoot(
    grid: Grid,
    theme: Theme
): TicTacToeRoot {
    const eventDispatcher: EventDispatcher<TicTacToeEventMap> = new EventDispatcher({
        statehidden: [],
        positionrevealed: []
    });
    const parent: TicTacToeParent = {
        notifyRevealedPosition(position: RevealedPosition): void {
            impl.revealPosition(position);
            eventDispatcher.dispatchEvent('positionrevealed', position);
        },
        notifyHiddenState(state: GameState): void {
            impl.hideState(state);
            eventDispatcher.dispatchEvent('statehidden', state);
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
            eventDispatcher.addEventListener(type, listener);
        },
        removeEventListener<TType extends keyof TicTacToeEventMap>(type: TType, listener: (ev: TicTacToeEventMap[TType]) => void): void {
            eventDispatcher.removeEventListener(type, listener);
        }
    };
}