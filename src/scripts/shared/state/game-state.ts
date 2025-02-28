import { otherPlayer, Player } from "../player";
import { PositionStream } from "./position-stream";
import { getThrees } from "../three";
import { Identity, Transformation, combine } from "../transformations";
import { Winner } from "../winner";
import { PositionSet } from "./position-set";

export interface ClonedGameState {
    positions: number
}

export class GameState {
    public get id(): number {return this.positions; }
    private constructor(private readonly positions: number){}


    private *getPredecessors(): Iterable<GameState>{
        const stream = new PositionStream(0);
        yield GameState.initial;
        for(const position of PositionStream.readAll(this.positions)){
            stream.write(position);
            yield new GameState(stream.positions);
        }
    }

    private getPositions(): Generator<number> {
        return PositionStream.readAll(this.positions);
    }

    public getPositionSet(): PositionSet{
        return PositionSet.fromPlayedPositions(PositionStream.readAll(this.positions));
    }

    public getNonequivalentSuccessors(): GameState[] {
        const positionSet = this.getPositionSet();
        const playersAtPositions = [...positionSet.getPlayersAtPositions()];
        const currentPlayer = this.getCurrentPlayer();
        const result: GameState[] = [];
        for(let position = 0; position < 9; position++){
            if(playersAtPositions[position] !== 0){
                continue;
            }
            const newPositionSet = positionSet.withPlayerAtPosition(currentPlayer, position);
            const isEquivalent = result.some(s => s.getPositionSet().isEquivalentTo(newPositionSet));
            if(isEquivalent){
                continue;
            }
            result.push(this.playPosition(position));
        }
        return result;
    }

    public getEquivalentWithSameLineage(predecessor: GameState): GameState | undefined {
        const thisPositions = this.getPositions();
        const predecessorPositions = predecessor.getPositions();
        const resultStream = new PositionStream(0);
        let currentPositionSet = new PositionSet(0);
        let currentTransformation = Identity;
        let player = Player.X;
        let thisPositionIteratorResult: IteratorResult<number> | undefined;
        let predecessorPositionIteratorResult: IteratorResult<number> | undefined;
        while(
            !thisPositionIteratorResult ||
            !thisPositionIteratorResult.done ||
            !predecessorPositionIteratorResult ||
            !predecessorPositionIteratorResult.done
        ){
            thisPositionIteratorResult = thisPositions.next();
            predecessorPositionIteratorResult = predecessorPositions.next();
            if(thisPositionIteratorResult.done){
                break;
            }
            
            let equivalentPosition: number = currentTransformation.positions[thisPositionIteratorResult.value];
            if(!predecessorPositionIteratorResult.done){
                const predecessorPosition = predecessorPositionIteratorResult.value;
                if(predecessorPosition !== equivalentPosition){
                    let additionalTransformation: Transformation | undefined;
                    for(const currentPositionSetOwnTransformation of currentPositionSet.getOwnTransformations()){
                        if(currentPositionSetOwnTransformation.positions[equivalentPosition] === predecessorPosition){
                            additionalTransformation = currentPositionSetOwnTransformation;
                            break;
                        }
                    }
                    if(!additionalTransformation){
                        return undefined;
                    }
                    currentTransformation = combine(currentTransformation, additionalTransformation);
                    equivalentPosition = predecessorPosition;
                }
            }
            resultStream.write(equivalentPosition);
            currentPositionSet = currentPositionSet.withPlayerAtPosition(player, equivalentPosition);
            player = otherPlayer(player);

        }
        return new GameState(resultStream.positions);
    }

    public getLastPlayedPosition(): number | undefined {
        const positions = [...PositionStream.readAll(this.positions)];
        if(positions.length === 0){
            return undefined;
        }
        return positions[positions.length - 1];
    }

    public equals(other: GameState): boolean{
        return !!other && other.positions === this.positions;
    }

    public findWinner(): Winner | undefined{
        const playersAtPositions = [...this.getPlayersAtPositions()];
        for(const three of getThrees()){
            const playerAtFirstPosition = playersAtPositions[three.positions[0]];
            if(playerAtFirstPosition === 0){
                continue;
            }
            const playerAtSecondPosition = playersAtPositions[three.positions[1]];
            if(playerAtSecondPosition !== playerAtFirstPosition){
                continue;
            }
            const playerAtThirdPosition = playersAtPositions[three.positions[2]];
            if(playerAtThirdPosition !== playerAtFirstPosition){
                continue;
            }
            return {
                three,
                player: playerAtFirstPosition
            }
        }
        return undefined;
    }

    public getPlayersAtPositions(): Iterable<Player | 0>{
        return this.getPositionSet().getPlayersAtPositions();
    }

    public playPosition(position: number): GameState{
        const stream = new PositionStream(this.positions);
        stream.moveToEnd();
        stream.write(position);
        return new GameState(stream.positions);
    }

    public getCurrentPlayer(): Player {
        const positions = [...PositionStream.readAll(this.positions)];
        return positions.length % 2 === 0 ? Player.X : Player.O;
    }

    public toJSON(): number[] {
        return [...this.getPositions()];
    }

    public static reviveCloned(cloned: ClonedGameState): GameState {
        const positions = PositionStream.readAll(cloned.positions);
        const resultStream = new PositionStream(0);
        for(const position of positions){
            resultStream.write(position);
        }
        return new GameState(resultStream.positions);
    }

    public static initial: GameState = new GameState(0)
}