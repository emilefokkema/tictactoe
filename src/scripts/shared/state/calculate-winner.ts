import { otherPlayer, type Player } from "../player";
import type { GameState } from "./game-state";

export interface WinnerCalculator {
    addChildWinner(childWinner: Player | undefined): void;
    finish(): void;
    done: boolean
    result: Player | undefined
}

export function calculateWinner(state: GameState): WinnerCalculator {
    const currentPlayer = state.getCurrentPlayer();
    let previousPlayerWinsInAllChildren = true;
    let previousPlayerWinsInChild = false;
    let done = false;
    let result: Player | undefined = undefined;
    return {
        get done(): boolean {return done;},
        get result(): Player | undefined {
            return result;
        },
        addChildWinner(childWinner: Player | undefined): void{
            if(done){
                return;
            }
            if(childWinner === currentPlayer){
                result = childWinner;
                done = true;
                return;
            }
            if(childWinner){
                previousPlayerWinsInChild = true;
                return;
            }
            if(previousPlayerWinsInChild){
                done = true;
                return;
            }
            previousPlayerWinsInAllChildren = false;
        },
        finish(): void {
            if(done){
                return;
            }
            done = true;
            if(previousPlayerWinsInChild && previousPlayerWinsInAllChildren){
                result = otherPlayer(currentPlayer);
            }
        }
    }
}