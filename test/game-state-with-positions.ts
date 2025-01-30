import { GameState } from "../src/scripts/state/game-state";

export function gameStateWithPositions(positions: number[]): GameState {
    let result = GameState.initial;
    for(const position of positions){
        result = result.playPosition(position)
    }
    return result;
}