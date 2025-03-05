import { otherPlayer, Player } from "../player";
import { getThrees } from "../three";
import type { Winner } from "../winner";
import type { GameState } from "./game-state";
import { PositionBuilder } from "./position-builder";
import { PositionSet } from "./position-set";

export class GameStateImpl {
    public get id(): number {return this.positionBuilder.positions;}
    private constructor(
        private readonly positionBuilder: PositionBuilder,
        private readonly positionSet: PositionSet,
        private readonly currentPlayer: Player
    ){

    }

    public getNonequivalentSuccessors(): GameStateImpl[] {
        const result: GameStateImpl[] = [];
        const nextPlayer = otherPlayer(this.currentPlayer);
        for(const emptyPosition of this.positionSet.getEmptyPositions()){
            const newPositionSet = this.positionSet.withPlayerAtPosition(this.currentPlayer, emptyPosition);
            if(result.some(s => s.positionSet.isEquivalentTo(newPositionSet))){
                continue;
            }
            const newPositionBuilder = this.positionBuilder.write(emptyPosition);
            result.push(new GameStateImpl(
                newPositionBuilder,
                newPositionSet,
                nextPlayer
            ))
        }
        return result;
    }

    public getLastPlayedPosition(): number | undefined {
        return this.positionBuilder.lastPlayedPosition;
    }

    public equals(other: GameState): boolean {
        return this.id === other.id;
    }

    public getPlayersAtPositions(): Iterable<Player | 0> {
        return this.positionSet.getPlayersAtPositions();
    }

    public playPosition(position: number) {
        const newPositionBuilder = this.positionBuilder.write(position);
        if(newPositionBuilder === this.positionBuilder){
            return this;
        }
        return new GameStateImpl(
            newPositionBuilder,
            this.positionSet.withPlayerAtPosition(this.currentPlayer, position),
            otherPlayer(this.currentPlayer)
        )
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

    public getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    public toJSON(): number[] {
        return [...PositionBuilder.readAllPositions(this.positionBuilder.positions)]
    }

    public static initial: GameStateImpl = new GameStateImpl(
        PositionBuilder.initial,
        new PositionSet(0),
        Player.X
    )
}