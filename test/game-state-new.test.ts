import { describe, it, expect, beforeEach } from 'vitest'
import { GameStateImpl } from '../src/scripts/shared/state/new-game-state-impl'
import { Player } from '../src/scripts/shared/player';
import { gameStateWithPositions } from './new-game-state-with-positions';
import type { GameState } from '@shared/state/game-state';

describe('a game state', () => {

    it('should have a current player', () => {
        let state = GameStateImpl.initial;

        expect(state.getCurrentPlayer()).toBe(Player.X)

        state = state.playPosition(1);

        expect(state.getCurrentPlayer()).toBe(Player.O)
    })

    it('should return player at position', () => {
        const state = GameStateImpl.initial.playPosition(0).playPosition(1);

        const playersAtPositions = [...state.getPlayersAtPositions()];
        expect(playersAtPositions[0]).toBe(Player.X);
        expect(playersAtPositions[1]).toBe(Player.O);
        expect(playersAtPositions[2]).toBe(0)
    })

    it.each<[GameStateImpl, GameStateImpl[]]>([
        [
            GameStateImpl.initial,
            [
                GameStateImpl.initial.playPosition(0),
                GameStateImpl.initial.playPosition(1),
                GameStateImpl.initial.playPosition(4)
            ]
        ],
        [
            gameStateWithPositions([0, 5, 2, 1, 4, 3]),
            [
                gameStateWithPositions([0, 5, 2, 1, 4, 3, 6]),
                gameStateWithPositions([0, 5, 2, 1, 4, 3, 7])
            ]
        ],
    ])('%j should have nonequivalent successors', (state, expectedNonequivalentSuccessors) => {
        expect(state.getNonequivalentSuccessors()).toEqual(expectedNonequivalentSuccessors)
    })
})