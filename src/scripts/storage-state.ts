import { WriteTicTacToe } from "./content/write-tictactoe";
import { Player } from "./player";
import { GameState } from "./state/game-state";
import { RevealedPosition } from "./state/revealed-position";

type StorageStateJson = {
    [position: number]: StorageStateJson
    w?: Player
}

export class StorageState implements WriteTicTacToe {
    private constructor(
        private readonly gameState: GameState,
        private readonly positions: (StorageState | undefined)[] = [],
        private winner?: Player | undefined
    ){

    }
    private getNextStateAndPosition(state: GameState): {state: GameState, position: number} | undefined {
        const index = state.indexOfPredecessor(this.gameState);
        if(index === -1){
            return undefined;
        }
        const nextState = state.predecessorAtIndex(index + 1);
        if(!nextState){
            return undefined;
        }
        const nextPosition = nextState.getLastPlayedPosition()!;
        return {
            state: nextState,
            position: nextPosition
        }
    }
    public revealPosition(position: RevealedPosition): void {
        const winner = position.winner;
        if(winner && winner.gameState.equals(this.gameState)){
            this.winner = winner.player;
        }
        const next = this.getNextStateAndPosition(position.gameState);
        if(!next){
            return;
        }
        const childState = this.positions[next.position] = this.positions[next.position] || new StorageState(next.state);
        childState.revealPosition(position);
    }

    public hideState(state: GameState): void{
        const next = this.getNextStateAndPosition(state);
        if(!next){
            return;
        }
        if(next.state.equals(state)){
            this.positions[next.position] = undefined;
            return;
        }
        const storageStateForNextState = this.positions[next.position];
        if(!storageStateForNextState){
            return;
        }
        storageStateForNextState.hideState(state);
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
            return;
        }
        if(!revealed && !this.gameState.equals(GameState.initial)){
            yield {
                gameState: this.gameState,
                winner: undefined
            }
        }
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