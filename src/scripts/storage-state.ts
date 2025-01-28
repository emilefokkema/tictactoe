import { GameState } from "./state/game-state";
import { RevealedPosition } from "./state/revealed-position";

export class StorageState {
    private readonly positions: StorageState[] = [];
    private constructor(private readonly gameState: GameState){

    }
    public addRevealedPosition(position: RevealedPosition): void {
        const index = position.gameState.indexOfPredecessor(this.gameState);
        if(index === -1){
            return;
        }
        const nextState = position.gameState.predecessorAtIndex(index + 1);
        if(!nextState){
            return;
        }
        const nextPosition = nextState.getLastPlayedPosition()!;
        const childState = this.positions[nextPosition] = this.positions[nextPosition] || new StorageState(nextState);
        childState.addRevealedPosition(position);
    }

    public removeState(state: GameState): void {

    }

    public toJSON(){
        const result: {[index: number]: StorageState} = {};
        for(let i = 0; i < 9; i++){
            const stateAtIndex = this.positions[i];
            if(stateAtIndex){
                result[i] = stateAtIndex;
            }
        }
        return result;
    }

    public static create(): StorageState {
        return new StorageState(GameState.initial);
    }
}