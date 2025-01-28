import { describe, beforeEach, it, expect } from 'vitest'
import { StorageState } from '../src/scripts/storage-state';
import { GameState } from '../src/scripts/state/game-state';

describe('a storage state', () => {

    it('should store revealed positions', () => {
        const state = StorageState.create();
        state.addRevealedPosition({
            gameState: GameState.initial.playPosition(0),
            winner: undefined
        })
        state.addRevealedPosition({
            gameState: GameState.initial.playPosition(2).playPosition(1),
            winner: undefined
        })
        console.log(JSON.stringify(state))
    })
})