import { GameStateImpl } from "../src/scripts/shared/state/game-state-impl";

export function gameStateWithPositions(positions: number[]): GameStateImpl {
    let result = GameStateImpl.initial;
    for(const position of positions){
        result = result.playPosition(position)
    }
    return result;
}