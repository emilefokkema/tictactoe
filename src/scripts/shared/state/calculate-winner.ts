import { otherPlayer, type Player } from "../player";
import type { GameState } from "./game-state";

function *getWinnerCalculatorGenerator(
    state: GameState
): Generator<undefined, Player | undefined, Player | undefined>{
    const currentPlayer = state.getCurrentPlayer();
    let previousPlayerWinsInAllChildren = true;
    let previousPlayerWinsInChild = false;
    while(true){
        let childWinner: Player | undefined;
        let done = true;
        try{
            childWinner = yield;
            done = false;
        }finally{
            if(done && previousPlayerWinsInChild && previousPlayerWinsInAllChildren){
                return otherPlayer(currentPlayer);
            }
        }
        if(childWinner === currentPlayer){
            return childWinner;
        }
        if(childWinner){
            previousPlayerWinsInChild = true;
            continue;
        }
        if(previousPlayerWinsInChild){
            return undefined;
        }
        previousPlayerWinsInAllChildren = false;
    }
}

export interface WinnerCalculator {
    addChildWinner(childWinner: Player | undefined): void;
    getResult(): Player | undefined;
}

export function calculateWinner(state: GameState): WinnerCalculator {
    const generator = getWinnerCalculatorGenerator(state);
    generator.next();
    let done = false;
    let result: Player | undefined = undefined;
    return {
        addChildWinner(childWinner: Player | undefined): void{
            if(done){
                return;
            }
            const iteratorResult = generator.next(childWinner);
            done = !!iteratorResult.done;
            if(done){
                result = iteratorResult.value;
            }
        },
        getResult(): Player | undefined {
            if(done){
                return result;
            }
            const returnResult = generator.return(undefined);
            done = true;
            return returnResult.value;
        }
    }
}