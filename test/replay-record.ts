import { RevealedPosition } from "../src/scripts/state/revealed-position"
import { TicTacToeStoreMutations } from "../src/scripts/store/tictactoe-store"
import { gameStateWithPositions } from "./game-state-with-positions"

interface RevealedRecordEntry {
    revealed: {
        gameState: number[],
        winner?: {
            player: number,
            gameState: number[]
        } | undefined
    }
}

interface HiddenRecordEntry {
    hidden: number[]
}

type RecordEntry = RevealedRecordEntry | HiddenRecordEntry

function isReveal(entry: RecordEntry): entry is RevealedRecordEntry {
    return (entry as RevealedRecordEntry).revealed !== undefined;
}

function isHide(entry: RecordEntry): entry is HiddenRecordEntry {
    return (entry as HiddenRecordEntry).hidden !== undefined;
}

function createRevealedPosition(entry: RevealedRecordEntry): RevealedPosition {
    const gameState = gameStateWithPositions(entry.revealed.gameState);
    const entryWinner = entry.revealed.winner;
    if(!entryWinner){
        return { gameState, winner: undefined }
    }
    return {
        gameState,
        winner: {
            gameState: gameStateWithPositions(entryWinner.gameState),
            player: entryWinner.player
        }
    }
}

export function replayRecord(store: TicTacToeStoreMutations, record: RecordEntry[]): void {
    for(const entry of record){
        if(isReveal(entry)){
            store.revealPosition(createRevealedPosition(entry));
            continue;
        }
        if(isHide(entry)){
            store.hideState(gameStateWithPositions(entry.hidden))
        }
    }
}