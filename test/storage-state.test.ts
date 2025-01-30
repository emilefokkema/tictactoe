import { describe, beforeEach, it, expect } from 'vitest'
import { StorageState } from '../src/scripts/storage-state';
import { revealedPosition } from './revealed-position-builder';
import { Player } from '../src/scripts/player';

function serializeAndDeserialize(state: StorageState): StorageState {
    const serialized = JSON.stringify(state);
    const deserialized = StorageState.fromJSON(JSON.parse(serialized));
    return deserialized;
}

describe('a storage state', () => {

    describe('that is built up', () => {
        let initialState: StorageState;

        beforeEach(() => {
            initialState = StorageState.create();
            const positions = [
                revealedPosition([0]),
                revealedPosition([0, 1]),
                revealedPosition([0, 1, 3]),
                revealedPosition([0, 1, 3, 6]),
                revealedPosition([0, 1, 3, 6, 4]),
                revealedPosition([0, 1, 3, 6, 4, 5]),
                revealedPosition([0, 1, 3, 6, 4, 5, 8], Player.X, [0, 1, 3, 6, 4, 5]),
                revealedPosition([0, 1, 3, 6, 4, 2]),
                revealedPosition([0, 1, 3, 6, 4, 2, 5], Player.X, [0, 1, 3, 6, 4, 2]),
                revealedPosition([0, 1, 3, 6, 4, 8]),
                revealedPosition([0, 1, 3, 6, 4, 8, 5], Player.X, [0, 1, 3, 6, 4, 8]),
                revealedPosition([0, 1, 3, 6, 4, 7]),
                revealedPosition([0, 1, 3, 6, 4, 7, 5], Player.X, [0, 1, 3, 6]),
                revealedPosition([0, 1, 3, 4]),
                revealedPosition([0, 1, 3, 4, 6], Player.X, [0, 1, 3, 4]),
                revealedPosition([0, 1, 3, 7]),
                revealedPosition([0, 1, 3, 7, 6], Player.X, [0, 1, 3, 7]),
                revealedPosition([0, 1, 3, 2]),
                revealedPosition([0, 1, 3, 2, 6], Player.X, [0, 1, 3, 2]),
                revealedPosition([0, 1, 3, 5]),
                revealedPosition([0, 1, 3, 5, 6], Player.X, [0, 1, 3, 5]),
                revealedPosition([0, 1, 3, 8]),
                revealedPosition([0, 1, 3, 8, 6], Player.X, [0, 1]),
            ];
            for(const position of positions){
                initialState.addRevealedPosition(position)
            }
        })

        it('should serialize and deserialize correctly', () => {
            const cloned = serializeAndDeserialize(initialState);
            const revealed = [...cloned.getRevealedPositions()];
            expect(revealed).toEqual([
                revealedPosition([0, 1, 3, 2, 6], Player.X, [0, 1, 3, 2]),
                revealedPosition([0, 1, 3, 4, 6], Player.X, [0, 1, 3, 4]),
                revealedPosition([0, 1, 3, 5, 6], Player.X, [0, 1, 3, 5]),
                revealedPosition([0, 1, 3, 6, 4, 2, 5], Player.X, [0, 1, 3, 6, 4, 2]),
                revealedPosition([0, 1, 3, 6, 4, 5, 8], Player.X, [0, 1, 3, 6, 4, 5]),
                revealedPosition([0, 1, 3, 6, 4, 7, 5], Player.X, [0, 1, 3, 6]),
                revealedPosition([0, 1, 3, 6, 4, 8, 5], Player.X, [0, 1, 3, 6, 4, 8]),
                revealedPosition([0, 1, 3, 7, 6], Player.X, [0, 1, 3, 7]),
                revealedPosition([0, 1, 3, 8, 6], Player.X, [0, 1]),
            ])
        })
    })
})