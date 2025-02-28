import { otherPlayer, Player } from "../player";
import { allTransformations, Transformation } from "../transformations";

export class PositionSet{
    public constructor(private readonly positions: number){

    }

    public equals(other: PositionSet): boolean{
        return !!other && other.positions === this.positions;
    }

    public transform(transformation: Transformation): PositionSet{
        let positions = 0;
        let positionIndex = 0;
        for(const player of this.getPlayersAtPositions()){
            positions |= (player << (2 * transformation.positions[positionIndex++]));
        }
        return new PositionSet(positions);
    }

    public *getOwnTransformations(): Iterable<Transformation> {
        for(const transformation of allTransformations){
            if(this.transform(transformation).equals(this)){
                yield transformation;
            }
        }
    }

    public *getTransformationsFrom(other: PositionSet): Iterable<Transformation>{
        if(!other){
            return;
        }
        for(const transformation of allTransformations){
            if(other.transform(transformation).equals(this)){
                yield transformation;
            }
        }
    }

    public withPlayerAtPosition(player: Player, position: number): PositionSet {
        return new PositionSet(this.positions | (player << (2 * position)))
    }

    public isEquivalentTo(other: PositionSet): boolean{
        if(!other){
            return false;
        }
        for(const transformation of this.getTransformationsFrom(other)){
            return true;
        }
        return false;
    }

    public *getPlayersAtPositions(): Iterable<Player | 0>{
        for(let position = 0; position < 9; position++){
            yield (this.positions >> (2 * position)) & 3;
        }
    }

    public static fromPlayedPositions(playedPositions: Iterable<number>): PositionSet{
        let positions = 0;
        let player = Player.X;
        for(const playedPosition of playedPositions){
            positions |= (player << (2 * playedPosition));
            player = otherPlayer(player)
        }
        return new PositionSet(positions);
    }
}