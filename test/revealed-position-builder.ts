import { Player } from "../src/scripts/player";
import { RevealedPosition } from "../src/scripts/state/revealed-position";
import { gameStateWithPositions } from "./game-state-with-positions";

export function revealedPosition(positions: number[], winner?: Player, winnerPositions?: number[]): RevealedPosition{
    const gameState = gameStateWithPositions(positions);
    if(winner !== undefined){
        const winnerGameState = winnerPositions === undefined ? gameState : gameStateWithPositions(winnerPositions)
        return {
            gameState,
            winner: {
                player: winner,
                gameState: winnerGameState
            }
        }
    }
    return { gameState, winner: undefined }
}