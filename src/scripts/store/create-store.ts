import { TicTacToeStore } from "./tictactoe-store";
import { TicTacToeStoreImpl } from "./tictactoe-store-impl";

export function createStore(): TicTacToeStore {
    return new TicTacToeStoreImpl();
}