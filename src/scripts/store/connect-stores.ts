import { TicTacToeStore } from "./tictactoe-store";

export function connectStores(one: TicTacToeStore, other: TicTacToeStore): void {
    one.addEventListener('positionrevealed', (p) => other.revealPosition(p));
    one.addEventListener('statehidden', (s) => other.hideState(s));
    other.addEventListener('positionrevealed', p => one.revealPosition(p));
    other.addEventListener('statehidden', s => one.hideState(s));
}