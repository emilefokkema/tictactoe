import { otherPlayer, Player } from "../player";
import { PositionStream } from "./position-stream";
import { getThrees } from "../three";
import { Identity, type Transformation, combine } from "../transformations";
import type { Winner } from "../winner";
import { PositionSet } from "./position-set";
import type { GameState } from "./game-state";
import type { ClonedGameState } from "./cloned-game-state";

export class GameStateImpl implements GameState {
    public get id(): number {return this.positions; }
    private constructor(private readonly positions: number){}

    public getPositions(): Generator<number> {
        return PositionStream.readAll(this.positions);
    }

    private getPositionSet(): PositionSet{
        return PositionSet.fromPlayedPositions(PositionStream.readAll(this.positions));
    }

    public getNonequivalentSuccessors(): GameStateImpl[] {
        const positionStream = PositionStream.create(this.positions);
        const playedPositions = [...positionStream.readAll()];
        const positionSet = PositionSet.fromPlayedPositions(playedPositions);
        const playersAtPositions = [...positionSet.getPlayersAtPositions()];
        const currentPlayer = this.getCurrentPlayer();
        const result: {state: GameStateImpl, positionSet: PositionSet}[] = [];
        for(let position = 0; position < 9; position++){
            if(playersAtPositions[position] !== 0){
                continue;
            }
            const newPositionSet = positionSet.withPlayerAtPosition(currentPlayer, position);
            const isEquivalent = result.some(s => s.positionSet.isEquivalentTo(newPositionSet));
            if(isEquivalent){
                continue;
            }
            const clonedStream = positionStream.clone();
            clonedStream.write(position);
            result.push({state: new GameStateImpl(clonedStream.positions), positionSet: newPositionSet});
        }
        return result.map(s => s.state);
    }

    public getEquivalentWithSameLineage(predecessor: GameState): GameStateImpl | undefined {
        const thisPositions = this.getPositions();
        const predecessorPositions = predecessor.getPositions();
        const resultStream = PositionStream.create(0);
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
        return new GameStateImpl(resultStream.positions);
    }

    public getLastPlayedPosition(): number | undefined {
        const positions = [...PositionStream.readAll(this.positions)];
        if(positions.length === 0){
            return undefined;
        }
        return positions[positions.length - 1];
    }

    public equals(other: GameStateImpl): boolean{
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

    public playPosition(position: number): GameStateImpl{
        const stream = PositionStream.create(this.positions);
        stream.moveToEnd();
        stream.write(position);
        return new GameStateImpl(stream.positions);
    }

    public getCurrentPlayer(): Player {
        const positions = [...PositionStream.readAll(this.positions)];
        return positions.length % 2 === 0 ? Player.X : Player.O;
    }

    public toJSON(): number[] {
        return [...this.getPositions()];
    }

    public static reviveCloned(cloned: ClonedGameState): GameStateImpl {
        const positions = PositionStream.readAll(cloned.positions);
        const resultStream = PositionStream.create(0);
        for(const position of positions){
            resultStream.write(position);
        }
        return new GameStateImpl(resultStream.positions);
    }

    public static initial: GameStateImpl = new GameStateImpl(0)
}