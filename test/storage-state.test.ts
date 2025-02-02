import { describe, beforeEach, it, expect } from 'vitest'
import { StorageState } from '../src/scripts/store/storage-state';
import winner01 from './fixtures/winner-0-1.json'
import manyLosers from './fixtures/many-losers.json'
import { replayRecord } from './replay-record';
import { GameState } from '../src/scripts/state/game-state';
import { RevealedPosition } from '../src/scripts/state/revealed-position';

function serializeAndDeserialize(state: StorageState): StorageState {
    const serialized = JSON.stringify(state);
    const deserialized = StorageState.fromJSON(JSON.parse(serialized));
    return deserialized;
}

function restoreRevealedPositions(state: StorageState): RevealedPosition[] {
    const cloned = serializeAndDeserialize(state);
    return [...cloned.getRevealedPositions()];
}

function stringifyRevealedPositions(positions: RevealedPosition[]): string {
    const result = JSON.stringify(positions, null, 2);
    return result;
}

describe('a storage state', () => {

    describe('that is built up', () => {
        let initialState: StorageState;

        beforeEach(() => {
            initialState = StorageState.create();
            replayRecord(initialState, winner01)
        })

        it('should serialize and deserialize correctly', () => {
            const revealed = restoreRevealedPositions(initialState);
            expect(stringifyRevealedPositions(revealed)).toMatchSnapshot();
        })

        it('should hide state', () => {
            initialState.hideState(GameState.initial.playPosition(0).playPosition(1).playPosition(3));
            const revealed = restoreRevealedPositions(initialState);
            expect(stringifyRevealedPositions(revealed)).toMatchSnapshot();
        })
    });

    describe('based on the many losers scenario', () => {
        let initialState: StorageState;

        beforeEach(() => {
            initialState = StorageState.create();
            replayRecord(initialState, manyLosers)
        })

        it('should serialize and deserialize correctly', () => {
            const revealed = restoreRevealedPositions(initialState);
            expect(stringifyRevealedPositions(revealed)).toMatchSnapshot();
        })
    })

    describe('that is empty', () => {
        let state: StorageState;

        beforeEach(() => {
            state = StorageState.create();
        })

        it('should serialize and deserialize correctly', () => {
            const revealed = restoreRevealedPositions(state);
            expect(stringifyRevealedPositions(revealed)).toMatchSnapshot();
        })
    })

    describe('that has revealed positions', () => {
        let state: StorageState;

        beforeEach(() => {
            state = StorageState.create();
            state.revealPosition({
                gameState: GameState.initial.playPosition(0).playPosition(1),
                winner: undefined
            })
        })

        it('should remove equivalent position', () => {
            state.hideState(GameState.initial.playPosition(6).playPosition(7));
            const content = [...state.getRevealedPositions()];
            expect(content).toEqual([
                {
                    gameState: GameState.initial.playPosition(0)
                }
            ])
        })

    })
})