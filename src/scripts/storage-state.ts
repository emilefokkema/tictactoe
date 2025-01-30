import { Player } from "./player";
import { GameState } from "./state/game-state";
import { RevealedPosition } from "./state/revealed-position";

type StorageStateJson = {
    [position: number]: StorageStateJson
    w?: Player
}

export class StorageState {
    private constructor(
        private readonly gameState: GameState,
        private readonly positions: StorageState[] = [],
        private winner?: Player | undefined
    ){

    }
    public addRevealedPosition(position: RevealedPosition): void {
        const winner = position.winner;
        if(winner && winner.gameState.equals(this.gameState)){
            this.winner = winner.player;
        }
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

    public *getRevealedPositions(): Iterable<RevealedPosition> {
        let revealed = false;
        let revealedWinner = false;
        for(let i = 0; i < 9; i++){
            const stateAtIndex = this.positions[i];
            if(!stateAtIndex){
                continue;
            }
            for(const {gameState, winner} of stateAtIndex.getRevealedPositions()){
                revealed = true;
                if(winner){
                    yield { gameState, winner }
                    continue;
                }
                if(this.winner !== undefined){
                    revealedWinner = true;
                    yield {
                        gameState,
                        winner: {
                            gameState: this.gameState,
                            player: this.winner
                        }
                    }
                    continue;
                }
                yield { gameState, winner }
            }
        }
        if(this.winner !== undefined && !revealedWinner){
            yield {
                gameState: this.gameState,
                winner: {
                    gameState: this.gameState,
                    player: this.winner
                }
            }
        }
        if(!revealed){
            yield {
                gameState: this.gameState,
                winner: undefined
            }
        }
    }

    public removeState(state: GameState): void {

    }

    public toJSON(){
        const result: {
            [index: number]: StorageState,
            w?: Player
        } = {};
        for(let i = 0; i < 9; i++){
            const stateAtIndex = this.positions[i];
            if(stateAtIndex){
                result[i] = stateAtIndex;
            }
        }
        if(this.winner){
            result.w = this.winner;
        }
        return result;
    }

    public static fromJSON(json: StorageStateJson, gameState?: GameState): StorageState {
        const state = gameState || GameState.initial;
        const winner = json.w;
        const positions: StorageState[] = [];
        for(let i = 0; i < 9; i++){
            const jsonAtIndex = json[i];
            if(!jsonAtIndex){
                continue;
            }
            const gameStateAtIndex = state.playPosition(i);
            positions[i] = this.fromJSON(jsonAtIndex, gameStateAtIndex);
        }
        return new StorageState(state, positions, winner);
    }

    public static create(): StorageState {
        return new StorageState(GameState.initial);
    }
}