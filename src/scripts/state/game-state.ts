import { Player } from "../player";
import { PositionStream } from "./position-stream";
import { getThrees } from "../three";
import { Transformation } from "../transformations";
import { Winner } from "../winner";
import { PositionSet } from "./position-set";

export class GameState {
    private constructor(private readonly positions: number){}

    private transformPositions(transformation: Transformation): number{
        const result = new PositionStream(0);
        for(const position of PositionStream.readAll(this.positions)){
            result.write(transformation.positions[position])
        }
        return result.positions;
    }

    private *getPredecessors(): Iterable<GameState>{
        const stream = new PositionStream(0);
        yield GameState.initial;
        for(const position of PositionStream.readAll(this.positions)){
            stream.write(position);
            yield new GameState(stream.positions);
        }
    }

    public getPositionSet(): PositionSet{
        return PositionSet.fromPlayedPositions(PositionStream.readAll(this.positions));
    }

    public indexOfPredecessor(other: GameState): number{
        let index = 0;
        for(const predecessor of this.getPredecessors()){
            if(predecessor.equals(other)){
                return index;
            }
            index++;
        }
        return -1;
    }

    public transform(transformation: Transformation): GameState{
        return new GameState(this.transformPositions(transformation))
    }

    public partialTransform(fromPredecessor: GameState, transformation: Transformation): GameState{
        const result = new PositionStream(0);
        let positionIsTransformed = false;
        for(const position of PositionStream.readAll(this.positions)){
            if(!positionIsTransformed && fromPredecessor.positions === result.positions){
                positionIsTransformed = true;
            }
            if(positionIsTransformed){
                result.write(transformation.positions[position])
            }else{
                result.write(position);
            }
        }
        return new GameState(result.positions);
    }

    public predecessorAtIndex(predecessorIndex: number): GameState | undefined{
        if(predecessorIndex < 0){
            const predecessors: GameState[] = new Array(1 - predecessorIndex);
            for(const predecessor of this.getPredecessors()){
                predecessors.pop();
                predecessors.unshift(predecessor)
            }
            return predecessors[-predecessorIndex];
        }
        let index = 0;
        for(const predecessor of this.getPredecessors()){
            if(index === predecessorIndex){
                return predecessor;
            }
            index++;
        }
        return undefined;
    }

    public *getSuccessors(): Iterable<GameState>{
        const playersAtPositions = [...this.getPlayersAtPositions()];
        for(let position = 0; position < 9; position++){
            if(playersAtPositions[position] !== 0){
                continue;
            }
            yield this.playPosition(position);
        }
    }

    public getTransformationsFrom(other: GameState): Iterable<Transformation>{
        if(!other){
            return []
        }
        return this.getPositionSet().getTransformationsFrom(other.getPositionSet())
    }

    public hasEquivalentPosition(other: GameState): boolean{
        if(!other){
            return false;
        }
        return this.getPositionSet().isEquivalentTo(other.getPositionSet());
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

    public getLastPlayedPosition(): number | undefined {
        const positions = [...PositionStream.readAll(this.positions)];
        if(positions.length === 0){
            return undefined;
        }
        return positions[positions.length - 1];
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

    public toJSON(){
        return [...PositionStream.readAll(this.positions)]
    }

    public toString(): string{
        const playersAtPositions = [...this.getPlayersAtPositions()];
        const symbols = [' ', 'X', 'O'];
        return `\n${symbols[playersAtPositions[0]]}|${symbols[playersAtPositions[1]]}|${symbols[playersAtPositions[2]]}\r\n` +
        `-+-+-\r\n` +
        `${symbols[playersAtPositions[3]]}|${symbols[playersAtPositions[4]]}|${symbols[playersAtPositions[5]]}\r\n` +
        `-+-+-\r\n` +
        `${symbols[playersAtPositions[6]]}|${symbols[playersAtPositions[7]]}|${symbols[playersAtPositions[8]]}`
    }

    public static initial: GameState = new GameState(0)
}